const express = require('express');
const router = express.Router();
const {
    getSalesReport,
    getDashboardStats,
    getTopProducts,
    getStaffPerformance
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/sales', protect, authorize('Admin'), getSalesReport);
router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/top-products', protect, authorize('Admin'), getTopProducts);
router.get('/staff-performance', protect, authorize('Admin'), getStaffPerformance);

module.exports = router;
