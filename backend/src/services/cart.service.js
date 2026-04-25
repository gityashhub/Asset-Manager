const Cart = require('../models/Cart');
const Product = require('../models/Product');

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate('items.product');
  }
  return cart;
}

async function addToCart(userId, productId, quantity = 1) {
  const product = await Product.findById(productId);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock || 99);
  } else {
    cart.items.push({ product: productId, quantity: Math.min(quantity, product.stock || 99) });
  }
  await cart.save();
  return cart.populate('items.product');
}

async function updateQuantity(userId, productId, quantity) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    const err = new Error('Cart not found');
    err.status = 404;
    throw err;
  }
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    const err = new Error('Item not in cart');
    err.status = 404;
    throw err;
  }
  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  return cart.populate('items.product');
}

async function removeFromCart(userId, productId) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return null;
  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  return cart.populate('items.product');
}

async function clearCart(userId) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return null;
  cart.items = [];
  await cart.save();
  return cart;
}

module.exports = { getOrCreateCart, addToCart, updateQuantity, removeFromCart, clearCart };
