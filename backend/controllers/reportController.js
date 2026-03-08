const Order = require('../models/Order');
const Supply = require('../models/Supply');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get sales report (daily/weekly/monthly)
// @route   GET /api/reports/sales
// @access  Admin
exports.getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const sales = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    },
                    orderStatus: { $ne: 'Cancelled' }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalRevenue: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard analytics (Total Revenue, Profit, etc)
// @route   GET /api/reports/dashboard-stats
// @access  Admin/Staff
exports.getDashboardStats = async (req, res) => {
    try {
        const totalRevenue = await Order.aggregate([
            { $match: { orderStatus: 'Delivered' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const totalCost = await Supply.aggregate([
            { $group: { _id: null, total: { $sum: "$totalCost" } } }
        ]);

        const lowStock = await Product.countDocuments({ stockQuantity: { $lte: 5 } });
        const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
        const totalProducts = await Product.countDocuments({ status: 'Active' });

        res.json({
            revenue: totalRevenue[0]?.total || 0,
            cost: totalCost[0]?.total || 0,
            profit: (totalRevenue[0]?.total || 0) - (totalCost[0]?.total || 0),
            lowStock,
            pendingOrders,
            totalProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get top selling products
// @route   GET /api/reports/top-products
// @access  Admin
exports.getTopProducts = async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            { $match: { orderStatus: 'Delivered' } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productName",
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        res.json(topProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get staff performance
// @route   GET /api/reports/staff-performance
// @access  Admin
exports.getStaffPerformance = async (req, res) => {
    try {
        const performance = await Order.aggregate([
            {
                $group: {
                    _id: "$createdBy",
                    orderCount: { $sum: 1 },
                    totalSales: { $sum: "$totalAmount" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "staffInfo"
                }
            },
            { $unwind: "$staffInfo" },
            {
                $project: {
                    name: "$staffInfo.name",
                    orderCount: 1,
                    totalSales: 1
                }
            }
        ]);

        res.json(performance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
