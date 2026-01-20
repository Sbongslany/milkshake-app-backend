const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    active: { type: Boolean, default: true },  // <-- Added for consistency with other lookups
});

module.exports = mongoose.model('Restaurant', restaurantSchema);