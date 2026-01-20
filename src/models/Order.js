const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    drinks: [{
        flavour: { type: mongoose.Schema.Types.ObjectId, ref: 'Flavour', required: true },
        consistency: { type: mongoose.Schema.Types.ObjectId, ref: 'Consistency', required: true },
        toppings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topping' }],
    }],
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    pickupTime: { type: Date, required: true },
    subtotalCents: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountCents: { type: Number, default: 0 },
    vatCents: { type: Number, required: true },
    totalCents: { type: Number, required: true },
    stripePaymentIntentId: { type: String },
    status: { type: String, enum: ['pending', 'paid', 'preparing', 'ready', 'completed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);