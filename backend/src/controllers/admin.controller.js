const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');

const stats = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    paidAgg,
    recentOrders,
    lowStock,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    Product.find({ stock: { $lte: 3 } }).sort({ stock: 1 }).limit(5),
  ]);

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    revenue: paidAgg[0]?.total || 0,
    recentOrders,
    lowStock,
  });
});

module.exports = { stats };
