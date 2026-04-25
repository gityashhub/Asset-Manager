const asyncHandler = require('express-async-handler');
const cartService = require('../services/cart.service');

const get = asyncHandler(async (req, res) => {
  const cart = await cartService.getOrCreateCart(req.user._id);
  res.json(cart);
});

const add = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) {
    res.status(400);
    throw new Error('productId is required');
  }
  const cart = await cartService.addToCart(req.user._id, productId, Number(quantity));
  res.status(201).json(cart);
});

const updateQty = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await cartService.updateQuantity(req.user._id, req.params.productId, Number(quantity));
  res.json(cart);
});

const remove = asyncHandler(async (req, res) => {
  const cart = await cartService.removeFromCart(req.user._id, req.params.productId);
  res.json(cart || { items: [] });
});

const clear = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user._id);
  res.json(cart || { items: [] });
});

module.exports = { get, add, updateQty, remove, clear };
