require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');

const products = [
  {
    name: 'Heritage Chronograph 41',
    brand: 'Ardent',
    description: 'A vintage-inspired chronograph with a panda dial and hand-finished movement. Limited heritage release.',
    price: 4850,
    originalPrice: 5200,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=900&q=80',
    ],
    stock: 8,
    category: 'Classic',
    movement: 'Automatic',
    caseMaterial: 'Stainless Steel',
    caseSize: '41mm',
    waterResistance: '50m',
    featured: true,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    name: 'Aurora Diver 300',
    brand: 'Maritima',
    description: 'A professional dive watch rated to 300m, with a unidirectional ceramic bezel and lume that glows for hours.',
    price: 3290,
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1539874754764-5a96559165b0?auto=format&fit=crop&w=900&q=80',
    ],
    stock: 15,
    category: 'Diver',
    movement: 'Automatic',
    caseMaterial: 'Titanium',
    caseSize: '42mm',
    waterResistance: '300m',
    featured: true,
    rating: 4.7,
    reviewCount: 98,
  },
  {
    name: 'Nocturne Skeleton',
    brand: 'Atelier Noir',
    description: 'An open-worked dial reveals every gear, bridge, and balance wheel of an in-house skeletonised movement.',
    price: 12400,
    images: [
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=900&q=80',
    ],
    stock: 3,
    category: 'Luxury',
    movement: 'Mechanical',
    caseMaterial: '18k Rose Gold',
    caseSize: '40mm',
    waterResistance: '30m',
    featured: true,
    rating: 4.9,
    reviewCount: 41,
  },
  {
    name: 'Field Pilot 39',
    brand: 'Cardinal',
    description: 'A purpose-built pilot watch with a high-legibility dial, anti-magnetic case, and supple leather strap.',
    price: 1290,
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
    ],
    stock: 24,
    category: 'Pilot',
    movement: 'Automatic',
    caseMaterial: 'Brushed Steel',
    caseSize: '39mm',
    waterResistance: '100m',
    featured: false,
    rating: 4.6,
    reviewCount: 211,
  },
  {
    name: 'Velour Dress Slim',
    brand: 'Ardent',
    description: 'Just 6.5mm thin, with a hand-applied sunray dial and Roman indices. The dress watch for quiet evenings.',
    price: 2150,
    images: [
      'https://images.unsplash.com/photo-1495856458515-0637185db551?auto=format&fit=crop&w=900&q=80',
    ],
    stock: 11,
    category: 'Dress',
    movement: 'Quartz',
    caseMaterial: 'Polished Steel',
    caseSize: '38mm',
    waterResistance: '30m',
    featured: false,
    rating: 4.5,
    reviewCount: 67,
  },
  {
    name: 'Velocity GMT',
    brand: 'Cardinal',
    description: 'A racing-inspired GMT with a 24-hour bezel that lets you track three time zones at a glance.',
    price: 3870,
    originalPrice: 4100,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=900&q=80',
    ],
    stock: 9,
    category: 'Sport',
    movement: 'Automatic',
    caseMaterial: 'Stainless Steel',
    caseSize: '42mm',
    waterResistance: '150m',
    featured: true,
    rating: 4.7,
    reviewCount: 152,
  },
  {
    name: 'Solstice Solar',
    brand: 'Helia',
    description: 'A solar-powered eco watch that runs perpetually on light, with a recycled-steel case.',
    price: 690,
    images: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1610384104075-e05c8cf200c3?auto=format&fit=crop&w=900&q=80',
    ],
    stock: 36,
    category: 'Sport',
    movement: 'Solar',
    caseMaterial: 'Recycled Steel',
    caseSize: '40mm',
    waterResistance: '100m',
    featured: false,
    rating: 4.4,
    reviewCount: 309,
  },
  {
    name: 'Pulse Smart 2',
    brand: 'Helia',
    description: 'A premium smart watch with health tracking, GPS, and a sapphire crystal display.',
    price: 549,
    images: [
      'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=900&q=80',
    ],
    stock: 42,
    category: 'Smart',
    movement: 'Smart',
    caseMaterial: 'Aluminum',
    caseSize: '44mm',
    waterResistance: '50m',
    featured: false,
    rating: 4.3,
    reviewCount: 487,
  },
  {
    name: 'Marquee Moonphase',
    brand: 'Atelier Noir',
    description: 'A poetic moonphase complication paired with a guilloché dial and blued steel hands.',
    price: 6750,
    images: [
      'https://images.unsplash.com/photo-1518131672697-613becd4fab5?auto=format&fit=crop&w=900&q=80',
    ],
    stock: 5,
    category: 'Luxury',
    movement: 'Mechanical',
    caseMaterial: '18k White Gold',
    caseSize: '40mm',
    waterResistance: '30m',
    featured: true,
    rating: 4.9,
    reviewCount: 58,
  },
  {
    name: 'Tide Diver Bronze',
    brand: 'Maritima',
    description: 'A bronze-cased diver that develops a unique patina over time, telling your story as it tells the time.',
    price: 2490,
    images: [
      'https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?auto=format&fit=crop&w=900&q=80',
    ],
    stock: 18,
    category: 'Diver',
    movement: 'Automatic',
    caseMaterial: 'Bronze',
    caseSize: '43mm',
    waterResistance: '200m',
    featured: false,
    rating: 4.6,
    reviewCount: 142,
  },
  {
    name: 'Concorde Sky',
    brand: 'Cardinal',
    description: 'A pilot chronograph with a slide-rule bezel and an open caseback showing the column-wheel movement.',
    price: 4290,
    images: [
      'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80',
    ],
    stock: 7,
    category: 'Pilot',
    movement: 'Automatic',
    caseMaterial: 'Stainless Steel',
    caseSize: '43mm',
    waterResistance: '100m',
    featured: false,
    rating: 4.7,
    reviewCount: 89,
  },
  {
    name: 'Linear 36',
    brand: 'Ardent',
    description: 'A minimalist time-only piece with a brushed dial and applied indices. Quiet, calm, considered.',
    price: 1690,
    images: [
      'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&w=900&q=80',
    ],
    stock: 22,
    category: 'Classic',
    movement: 'Automatic',
    caseMaterial: 'Polished Steel',
    caseSize: '36mm',
    waterResistance: '50m',
    featured: false,
    rating: 4.5,
    reviewCount: 173,
  },
];

(async () => {
  try {
    await connectDB();

    console.log('[seed] Clearing existing products...');
    await Product.deleteMany({});

    console.log('[seed] Inserting product catalogue...');
    await Product.insertMany(products);

    const adminEmail = 'admin@watchstore.test';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const passwordHash = await User.hashPassword('admin1234');
      await User.create({
        name: 'Store Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
      });
      console.log(`[seed] Admin created -> ${adminEmail} / admin1234`);
    } else {
      console.log('[seed] Admin already exists, skipping');
    }

    console.log('[seed] Done.');
    process.exit(0);
  } catch (err) {
    console.error('[seed] Failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
})();
