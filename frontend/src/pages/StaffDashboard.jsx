import React, { useState, useEffect } from 'react';
import {
    Plus,
    ShoppingCart,
    Box,
    AlertTriangle,
    Search,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';
import { formatCurrency } from '../utils/currency';

const StaffDashboard = () => {
    const [recentOrders, setRecentOrders] = useState([]);
    const [stats, setStats] = useState({
        pendingOrders: 0,
        lowStock: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaffData();
    }, []);

    const fetchStaffData = async () => {
        try {
            const [ordersRes, statsRes] = await Promise.all([
                api.get('/orders?limit=5'),
                api.get('/reports/dashboard-stats')
            ]);
            setRecentOrders(ordersRes.data.slice(0, 5));
            setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch staff data', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Operations Hub</h2>
                    <p className="text-gray-500 font-medium">Manage orders and monitor stock levels</p>
                </div>
                <Link to="/orders/new">
                    <Button className="py-4 px-8 rounded-2xl shadow-xl shadow-primary-500/20 text-lg font-bold">
                        <Plus className="mr-2" /> New Order
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatSimpleCard
                    title="Active Orders"
                    value={stats.pendingOrders}
                    icon={ShoppingCart}
                    color="primary"
                />
                <StatSimpleCard
                    title="Low Stock Alerts"
                    value={stats.lowStock}
                    icon={AlertTriangle}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card title="Latest Transactions">
                        <Table headers={['Customer', 'Status', 'Date', 'Amount']}>
                            {recentOrders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{order.customerName}</td>
                                    <td className="px-6 py-4">
                                        <Badge color={order.orderStatus === 'Delivered' ? 'green' : 'amber'}>
                                            {order.orderStatus}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(order.totalAmount)}
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white p-6 border-none shadow-2xl shadow-primary-500/20">
                        <h4 className="text-xl font-bold mb-2">Inventory Quick Check</h4>
                        <p className="text-primary-100 text-sm mb-6 opacity-80">Easily find product availability and pricing information.</p>
                        <Link to="/products">
                            <Button variant="secondary" className="w-full bg-white text-primary-600 hover:bg-primary-50 py-3 rounded-xl border-none font-bold">
                                Go to Catalog <ArrowRight className="ml-2" size={18} />
                            </Button>
                        </Link>
                    </Card>

                    <Card title="Quick Search">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 border border-gray-100 dark:border-gray-800 text-sm"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const StatSimpleCard = ({ title, value, icon: Icon, color }) => (
    <Card className={`border-l-4 ${color === 'primary' ? 'border-primary-500' : 'border-red-500'}`}>
        <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${color === 'primary' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                <Icon size={28} />
            </div>
            <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{title}</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h3>
            </div>
        </div>
    </Card>
);

export default StaffDashboard;
