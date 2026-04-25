const router = require('express').Router();
const { list, getById, brands, create, update, remove } = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', list);
router.get('/brands', brands);
router.get('/:id', getById);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
