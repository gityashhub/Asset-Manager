const asyncHandler = require('express-async-handler');
const { chatWithConcierge } = require('../services/ai.service');

const concierge = asyncHandler(async (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400);
    throw new Error('messages array is required');
  }
  const cleaned = messages
    .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({
      role: m.role,
      content: m.content.toString().slice(0, 2000),
    }))
    .slice(-10);

  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== 'user') {
    res.status(400);
    throw new Error('Last message must be from the user.');
  }

  try {
    const result = await chatWithConcierge({ messages: cleaned });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500);
    throw err;
  }
});

module.exports = { concierge };
