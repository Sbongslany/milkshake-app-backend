
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');

exports.ordersReport = async (req, res) => {
    const { startDate, endDate } = req.query;
    const match = { status: 'paid' }; // Only paid orders in report

    if (startDate) match.createdAt = { $gte: new Date(startDate) };
    if (endDate) {
        match.createdAt = match.createdAt || {};
        match.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(match).populate('user restaurant').sort({ createdAt: -1 });
    res.json(orders);
};

exports.dailyTrend = async (req, res) => {
    const trend = await Order.aggregate([
        { $match: { status: 'paid' } },
        {
            $group: {
                _id: { $dayOfWeek: '$createdAt' },
                count: { $sum: 1 },
                revenue: { $sum: '$totalCents' },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    res.json(trend);
};

exports.auditLog = async (req, res) => {
    const logs = await AuditLog.find()
        .populate('user', 'name email')
        .sort({ timestamp: -1 })
        .limit(200);
    res.json(logs);
};