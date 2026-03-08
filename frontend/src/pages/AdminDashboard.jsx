import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    ShoppingCart,
    Box,
    AlertTriangle,
    BarChart3,
    Clock,
    ArrowRight
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import api from '../api/axios';
import Card from '../components/common/Card';
import { formatCurrency } from '../utils/currency';

const COLORS = ['#ec4899', '#f43f5e', '#f97316', '#eab308', '#8b5cf6'];

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        revenue: 0,
        cost: 0,
        profit: 0,
        lowStock: 0,
        pendingOrders: 0,
        totalProducts: 0
    });
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, topProductsRes] = await Promise.all([
                api.get('/reports/dashboard-stats'),
                api.get('/reports/top-products')
            ]);
            setStats(statsRes.data);
            setTopProducts(topProductsRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Executive Dashboard</h2>
                    <p className="text-gray-500 font-medium">Real-time business performance analytics</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.revenue)}
                    icon={TrendingUp}
                    colorClass="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
                />
                <StatCard
                    title="Gross Profit"
                    value={formatCurrency(stats.profit)}
                    icon={BarChart3}
                    colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    icon={Clock}
                    colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                />
                <StatCard
                    title="Low Stock"
                    value={stats.lowStock}
                    icon={AlertTriangle}
                    colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Velocity Chart */}
                <Card title="Revenue Distribution">
                    <div className="h-80 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={topProducts}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="revenue" stroke="#ec4899" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Selling Products */}
                <Card title="Top Selling Products">
                    <div className="h-80 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="totalSold" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <Card className="relative overflow-hidden group hover:scale-[1.02] transition-all">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none">{value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${colorClass}`}>
                <Icon size={24} />
            </div>
        </div>
    </Card>
);

export default AdminDashboard;
