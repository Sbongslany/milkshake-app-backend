require('dotenv').config();
const mongoose = require('mongoose');
const Flavour = require('../models/Flavour');
const Topping = require('../models/Topping');
const Consistency = require('../models/Consistency');
const Restaurant = require('../models/Restaurant');
const Config = require('../models/Config');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    await Promise.all([
        Flavour.deleteMany({}), Topping.deleteMany({}), Consistency.deleteMany({}), Restaurant.deleteMany({})
    ]);

    await Flavour.insertMany([
        { name: 'Vanilla', price: 500 },
        { name: 'Chocolate', price: 550 },
    ]);

    await Topping.insertMany([
        { name: 'Sprinkles', price: 50 },
        { name: 'Oreo Crumbs', price: 100 },
    ]);

    await Consistency.insertMany([
        { name: 'Thin', price: 0 },
        { name: 'Thick', price: 100 },
    ]);

    await Restaurant.insertMany([
        { name: 'Benoni Branch', address: '123 Main St, Benoni' },
    ]);

    await Config.create({
        discountTiers: [
            { minPastOrders: 5, discountPercent: 5 },
            { minPastOrders: 10, discountPercent: 10 },
            { minPastOrders: 20, discountPercent: 15 },
        ]
    });

    console.log('Seeded');
    process.exit();
});