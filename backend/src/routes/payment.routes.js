const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/payment.controller');

router.use(protect);

router.post('/upi', c.payByUpi);
router.post('/cod', c.payByCod);
router.get('/mine', c.myPayments);

module.exports = router;
