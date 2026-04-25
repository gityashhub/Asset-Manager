const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    brand: String,
    image: String,
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    shippingAddress: {
      fullName: String,
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },
    status: {
      type: String,
      enum: [
        'pending_payment',
        'confirmed',
        'paid',
        'failed',
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ],
      default: 'pending_payment',
      index: true,
    },
    payment: {
      method: {
        type: String,
        enum: ['none', 'upi', 'cod'],
        default: 'none',
      },
      transactionId: String,
      upiId: String,
      status: {
        type: String,
        enum: ['unpaid', 'success', 'failure', 'pending'],
        default: 'unpaid',
      },
      paidAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
