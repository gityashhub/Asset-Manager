const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: {
      type: String,
      enum: ['Luxury', 'Sport', 'Classic', 'Smart', 'Diver', 'Dress', 'Pilot'],
      default: 'Classic',
      index: true,
    },
    movement: {
      type: String,
      enum: ['Automatic', 'Quartz', 'Mechanical', 'Solar', 'Smart'],
      default: 'Automatic',
    },
    caseMaterial: { type: String, default: 'Stainless Steel' },
    caseSize: { type: String, default: '40mm' },
    waterResistance: { type: String, default: '50m' },
    featured: { type: Boolean, default: false, index: true },
    rating: { type: Number, default: 4.6, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
