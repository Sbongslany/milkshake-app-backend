const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    vatRate: { type: Number, default: 15 },
    minDrinks: { type: Number, default: 1 },
    maxDrinks: { type: Number, default: 10 },
    minDrinksForDiscount: { type: Number, default: 1 }, // new
    discountTiers: [{
        minPastOrders: { type: Number, required: true },
        discountPercent: { type: Number, required: true, min: 0, max: 100 },
    }],
    maxDiscountPercent: { type: Number, default: 20 },
}, { timestamps: true });

// Ensure only one config document
configSchema.statics.getConfig = async function () {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

module.exports = mongoose.model('Config', configSchema);