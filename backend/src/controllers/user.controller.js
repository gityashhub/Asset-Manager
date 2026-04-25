const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const updateProfile = asyncHandler(async (req, res) => {
  const { name, address } = req.body;
  if (name) req.user.name = name;
  if (address) req.user.address = { ...req.user.address?.toObject?.(), ...address };
  await req.user.save();
  res.json({ user: req.user.toSafeJSON() });
});

const listAll = asyncHandler(async (_req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json(users);
});

module.exports = { updateProfile, listAll };
