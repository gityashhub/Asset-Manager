const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/payment.controller');

router.use(protect);

router.post('/simulate', c.simulate);
router.get('/mine', c.myPayments);

module.exports = router;
