const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/user.controller');

router.use(protect);

router.put('/me', c.updateProfile);
router.get('/', adminOnly, c.listAll);

module.exports = router;
