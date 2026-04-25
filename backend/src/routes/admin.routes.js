const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { stats } = require('../controllers/admin.controller');

router.use(protect, adminOnly);

router.get('/stats', stats);

module.exports = router;
