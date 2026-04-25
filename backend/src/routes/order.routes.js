const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/order.controller');

router.use(protect);

router.post('/', c.createFromCart);
router.get('/mine', c.myOrders);
router.get('/all', adminOnly, c.listAll);
router.get('/:id', c.getById);
router.patch('/:id/status', adminOnly, c.updateStatus);

module.exports = router;
