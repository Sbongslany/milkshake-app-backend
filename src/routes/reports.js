const express = require('express');
const { ordersReport, dailyTrend, auditLog } = require('../controllers/reportController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const router = express.Router();

router.get('/orders', auth, role('manager'), ordersReport);
router.get('/daily-trend', auth, role('manager'), dailyTrend);
router.get('/audit', auth, role('manager'), auditLog);

module.exports = router;