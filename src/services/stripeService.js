const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amountCents, metadata) => {
    return await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'zar',
        metadata,
    });
};

const retrievePaymentIntent = async (id) => {
    return await stripe.paymentIntents.retrieve(id);
};

module.exports = { createPaymentIntent, retrievePaymentIntent };