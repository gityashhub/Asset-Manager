const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const cartService = require('../services/cart.service');

const SHIPPING_FLAT = 25;
const TAX_RATE = 0.08;

const createFromCart = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.line1) {
    res.status(400);
    throw new Error('Shipping address with fullName and line1 is required');
  }

  const cart = await cartService.getOrCreateCart(req.user._id);
  if (!cart.items.length) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  const items = cart.items.map((i) => ({
    product: i.product._id,
    name: i.product.name,
    brand: i.product.brand,
    image: i.product.images?.[0],
    price: i.product.price,
    quantity: i.quantity,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal > 0 ? SHIPPING_FLAT : 0;
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  const order = await Order.create({
    user: req.user._id,
    items,
    subtotal,
    shipping,
    tax,
    total,
    shippingAddress,
    status: 'pending_payment',
    payment: { method: 'simulated', status: 'unpaid' },
  });

  res.status(201).json(order);
});

const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

const getById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Forbidden');
  }
  res.json(order);
});

const listAll = asyncHandler(async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
  res.json(orders);
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const valid = ['paid', 'failed', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json(order);
});

module.exports = { createFromCart, myOrders, getById, listAll, updateStatus };
