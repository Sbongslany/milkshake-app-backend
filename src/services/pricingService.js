const Config = require('../models/Config');
const Flavour = require('../models/Flavour');
const Topping = require('../models/Topping');
const Consistency = require('../models/Consistency');
const Order = require('../models/Order');

const calculatePricing = async (drinks, userId, config) => {
    let subtotalCents = 0;

    for (const drink of drinks) {
        const [flavour, consistency] = await Promise.all([
            Flavour.findById(drink.flavour),
            Consistency.findById(drink.consistency),
        ]);
        if (!flavour || !consistency) throw new Error('Invalid selection');

        const toppings = await Topping.find({ _id: { $in: drink.toppings || [] } });
        let drinkPrice = flavour.price + consistency.price;
        drinkPrice += toppings.reduce((sum, t) => sum + t.price, 0);
        subtotalCents += drinkPrice;
    }

    // Discount logic
    let discountPercent = 0;
    if (drinks.length >= config.minDrinksForDiscount) {
        const pastPaidOrders = await Order.countDocuments({ user: userId, status: 'paid' });
        for (const tier of config.discountTiers.sort((a, b) => b.minPastOrders - a.minPastOrders)) {
            if (pastPaidOrders >= tier.minPastOrders) {
                discountPercent = Math.min(tier.discountPercent, config.maxDiscountPercent || 100);
                break;
            }
        }
    }

    const discountCents = Math.round(subtotalCents * discountPercent / 100);
    const afterDiscount = subtotalCents - discountCents;
    const vatCents = Math.round(afterDiscount * config.vatRate / 100);
    const totalCents = afterDiscount + vatCents;

    return {
        subtotalCents,
        discountPercent,
        discountCents,
        vatCents,
        totalCents,
    };
};

module.exports = { calculatePricing };