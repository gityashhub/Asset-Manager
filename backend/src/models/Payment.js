const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['upi', 'cod'],
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'pending'],
      required: true,
    },
    transactionId: { type: String, required: true, unique: true },
    upiId: { type: String },
    rawResponse: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
