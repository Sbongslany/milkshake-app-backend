

const Order = require('../models/Order');
const Config = require('../models/Config');
const User = require('../models/User');
const { calculatePricing } = require('../services/pricingService');
const { createPaymentIntent, retrievePaymentIntent } = require('../services/stripeService');
const { sendOrderConfirmation } = require('../services/emailService');
const auditLogger = require('../utils/auditLogger');

exports.createPaymentIntent = async (req, res) => {
    try {
        const { drinks, restaurant, pickupTime } = req.body;
        const config = await Config.getConfig();

        // 1. Validation
        if (!drinks || !Array.isArray(drinks) || drinks.length < config.minDrinks || drinks.length > config.maxDrinks) {
            return res.status(400).json({ message: 'Invalid number of drinks' });
        }

        // 2. Calculate Pricing
        const pricing = await calculatePricing(drinks, req.user.id, config);

        // 3. Create a PENDING order in the database first
        // This stores the large 'drinks' array in MongoDB instead of Stripe metadata
        const order = await Order.create({
            user: req.user.id,
            drinks,
            restaurant,
            pickupTime,
            ...pricing,
            status: 'pending', // Important: mark as pending
        });

        // 4. Create Stripe Payment Intent using only the Order ID in metadata
        // This stays well under the 500 character limit
        const metadata = {
            orderId: order._id.toString(),
            userId: req.user.id,
        };

        const paymentIntent = await createPaymentIntent(pricing.totalCents, metadata);

        // 5. Save the Payment Intent ID to our order for lookup during confirmation
        order.stripePaymentIntentId = paymentIntent.id;
        await order.save();

        res.json({
            clientSecret: paymentIntent.client_secret,
            pricing,
            paymentIntentId: paymentIntent.id,
            orderId: order._id
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ message: 'Missing paymentIntentId' });
        }

        // 1. Retrieve the status from Stripe
        const paymentIntent = await retrievePaymentIntent(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment not succeeded' });
        }

        // 2. Extract our reference ID from metadata
        const { orderId, userId } = paymentIntent.metadata;

        if (userId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized payment intent' });
        }

        // 3. Find the existing order we created in the previous step
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order record not found' });
        }

        // 4. Handle double-processing (idempotency)
        if (order.status === 'paid') {
            return res.json({ order, message: 'Order already processed' });
        }

        // 5. Security: Verify amount hasn't changed since intent creation
        if (order.totalCents !== paymentIntent.amount) {
            return res.status(400).json({ message: 'Payment amount mismatch — possible tampering' });
        }

        // 6. Update order to 'paid'
        order.status = 'paid';
        await order.save();

        // 7. Post-payment actions
        await order.populate('restaurant');
        const user = await User.findById(req.user.id);

        try {
            await sendOrderConfirmation(user, order, order);
        } catch (emailErr) {
            console.error('Email failed but order saved:', emailErr);
        }

        await auditLogger(null, 'PAYMENT_SUCCESS', 'Order', order._id);

        res.json({ order });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getMyOrders = async (req, res) => {
    // Only return paid orders to the user's history
    const orders = await Order.find({
        user: req.user.id,
        status: 'paid'
    })
        .populate('restaurant')
        .sort({ createdAt: -1 });

    res.json(orders);
};