const express = require('express');
const {
    flavour,
    topping,
    consistency,
    restaurant,
} = require('../controllers/lookupController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// === FLAVOURS ===
router.route('/flavours')
    .get(auth, flavour.getAll);                    // Public (logged-in users)

router.route('/flavours')
    .post(auth, role('manager'), flavour.create);  // Admin only

router.route('/flavours/:id')
    .patch(auth, role('manager'), flavour.update)
    .delete(auth, role('manager'), flavour.deactivate);

// === TOPPINGS ===
router.route('/toppings')
    .get(auth, topping.getAll);

router.route('/toppings')
    .post(auth, role('manager'), topping.create);

router.route('/toppings/:id')
    .patch(auth, role('manager'), topping.update)
    .delete(auth, role('manager'), topping.deactivate);

// === CONSISTENCIES ===
router.route('/consistencies')
    .get(auth, consistency.getAll);

router.route('/consistencies')
    .post(auth, role('manager'), consistency.create);

router.route('/consistencies/:id')
    .patch(auth, role('manager'), consistency.update)
    .delete(auth, role('manager'), consistency.deactivate);

// === RESTAURANTS ===
router.route('/restaurants')
    .get(auth, restaurant.getAll);

router.route('/restaurants')
    .post(auth, role('manager'), restaurant.create);

router.route('/restaurants/:id')
    .patch(auth, role('manager'), restaurant.update)
    .delete(auth, role('manager'), restaurant.deactivate);

module.exports = router;