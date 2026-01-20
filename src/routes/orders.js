const express = require('express');
const {
    createPaymentIntent,
    confirmPayment,
    getMyOrders,
} = require('../controllers/orderController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/create-payment-intent', auth, createPaymentIntent);
router.post('/confirm-payment', auth, confirmPayment);
router.get('/my-orders', auth, getMyOrders);

module.exports = router;