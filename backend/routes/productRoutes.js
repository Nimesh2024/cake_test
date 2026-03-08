const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('Admin'), productController.createProduct);
router.get('/', protect, productController.getProducts);
router.get('/:id', protect, productController.getProductById);
router.put('/:id', protect, authorize('Admin'), productController.updateProduct);
router.delete('/:id', protect, authorize('Admin'), productController.deleteProduct);

module.exports = router;
