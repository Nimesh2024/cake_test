const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('Admin'), categoryController.createCategory);
router.get('/', protect, categoryController.getCategories);
router.put('/:id', protect, authorize('Admin'), categoryController.updateCategory);
router.delete('/:id', protect, authorize('Admin'), categoryController.deleteCategory);

module.exports = router;
