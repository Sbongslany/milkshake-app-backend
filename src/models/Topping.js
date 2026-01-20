const mongoose = require('mongoose');

const toppingSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 }, // cents
    active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Topping', toppingSchema);