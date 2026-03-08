const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('Admin'), supplierController.createSupplier);
router.get('/', protect, supplierController.getSuppliers);
router.put('/:id', protect, authorize('Admin'), supplierController.updateSupplier);
router.delete('/:id', protect, authorize('Admin'), supplierController.deleteSupplier);

module.exports = router;
