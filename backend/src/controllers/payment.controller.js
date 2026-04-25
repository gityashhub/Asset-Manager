const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const cartService = require('../services/cart.service');

function generateTransactionId() {
  return 'TXN-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

const simulate = asyncHandler(async (req, res) => {
  const { orderId, outcome } = req.body;
  if (!orderId || !['success', 'failure', 'pending'].includes(outcome)) {
    res.status(400);
    throw new Error('orderId and a valid outcome (success|failure|pending) are required');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Forbidden');
  }

  const transactionId = generateTransactionId();
  const payment = await Payment.create({
    order: order._id,
    user: req.user._id,
    amount: order.total,
    method: 'simulated',
    status: outcome,
    transactionId,
    rawResponse: { outcome, simulatedAt: new Date().toISOString() },
  });

  order.payment = {
    method: 'simulated',
    transactionId,
    status: outcome,
    paidAt: outcome === 'success' ? new Date() : undefined,
  };
  if (outcome === 'success') {
    order.status = 'paid';
    await cartService.clearCart(req.user._id);
  } else if (outcome === 'failure') {
    order.status = 'failed';
  } else {
    order.status = 'pending';
  }
  await order.save();

  res.status(201).json({ payment, order });
});

const myPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(payments);
});

module.exports = { simulate, myPayments };
