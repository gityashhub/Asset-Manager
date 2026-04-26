const router = require('express').Router();
const rateLimit = require('../middleware/rateLimit');
const { concierge } = require('../controllers/ai.controller');

router.post('/concierge', rateLimit({ windowMs: 60_000, max: 20 }), concierge);

module.exports = router;
