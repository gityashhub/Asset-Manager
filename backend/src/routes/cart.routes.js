const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/cart.controller');

router.use(protect);

router.get('/', c.get);
router.post('/items', c.add);
router.patch('/items/:productId', c.updateQty);
router.delete('/items/:productId', c.remove);
router.delete('/', c.clear);

module.exports = router;
