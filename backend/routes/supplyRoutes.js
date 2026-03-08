const express = require('express');
const router = express.Router();
const supplyController = require('../controllers/supplyController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, supplyController.createSupply);
router.get('/', protect, supplyController.getSupplies);
router.get('/:id', protect, supplyController.getSupplyById);
router.delete('/:id', protect, authorize('Admin'), supplyController.deleteSupply);

module.exports = router;
