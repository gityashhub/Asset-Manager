const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const cartService = require('../services/cart.service');

function generateTransactionId(prefix) {
  return (
    (prefix || 'TXN') +
    '-' +
    Date.now().toString(36).toUpperCase() +
    '-' +
    Math.random().toString(36).slice(2, 8).toUpperCase()
  );
}

// Permissive UPI VPA pattern: handle@psp (e.g. name@oksbi, 9876543210@paytm)
const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

async function loadOwnedOrder(req, res) {
  const order = await Order.findById(req.body.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Forbidden');
  }
  if (order.payment && order.payment.status === 'success') {
    res.status(400);
    throw new Error('Order is already paid');
  }
  return order;
}

const payByUpi = asyncHandler(async (req, res) => {
  const { upiId } = req.body;
  if (!upiId || !UPI_REGEX.test(upiId.trim())) {
    res.status(400);
    throw new Error('Please enter a valid UPI ID, e.g. yourname@okhdfc');
  }

  const order = await loadOwnedOrder(req, res);
  const trimmedUpi = upiId.trim();
  const transactionId = generateTransactionId('UPI');

  const payment = await Payment.create({
    order: order._id,
    user: req.user._id,
    amount: order.total,
    method: 'upi',
    status: 'success',
    transactionId,
    upiId: trimmedUpi,
    rawResponse: {
      gateway: 'mock-upi',
      vpa: trimmedUpi,
      processedAt: new Date().toISOString(),
    },
  });

  order.payment = {
    method: 'upi',
    transactionId,
    upiId: trimmedUpi,
    status: 'success',
    paidAt: new Date(),
  };
  order.status = 'paid';
  await order.save();
  await cartService.clearCart(req.user._id);

  res.status(201).json({ payment, order });
});

const payByCod = asyncHandler(async (req, res) => {
  const order = await loadOwnedOrder(req, res);
  const transactionId = generateTransactionId('COD');

  const payment = await Payment.create({
    order: order._id,
    user: req.user._id,
    amount: order.total,
    method: 'cod',
    status: 'pending',
    transactionId,
    rawResponse: {
      gateway: 'cash-on-delivery',
      collectOnDelivery: true,
      placedAt: new Date().toISOString(),
    },
  });

  order.payment = {
    method: 'cod',
    transactionId,
    status: 'pending',
  };
  order.status = 'confirmed';
  await order.save();
  await cartService.clearCart(req.user._id);

  res.status(201).json({ payment, order });
});

const myPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(payments);
});

module.exports = { payByUpi, payByCod, myPayments };
