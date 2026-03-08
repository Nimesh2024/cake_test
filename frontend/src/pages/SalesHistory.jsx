import React, { useState, useEffect } from 'react';
import {
    Search,
    Calendar,
    ShoppingBag,
    Eye,
    ArrowLeft,
    TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/currency';

const SalesHistory = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchSales();
    }, [searchTerm, dateFilter]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/orders', {
                params: {
                    customerName: searchTerm,
                    date: dateFilter,
                    type: 'DirectSale'
                }
            });
            // Filter locally just in case backend doesn't support 'type' param yet
            setSales(data.filter(s => s.type === 'DirectSale'));
        } catch (error) {
            console.error('Error fetching sales history', error);
            addToast('Failed to fetch sales history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const dailyTotal = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales History</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and track all direct storefront sales.</p>
                    </div>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 px-6 py-3 rounded-2xl border border-primary-100 dark:border-primary-800 flex items-center gap-4">
                    <div className="p-2 bg-primary-500 text-white rounded-xl">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider">Daily Total</p>
                        <p className="text-xl font-black text-primary-700 dark:text-primary-300">{formatCurrency(dailyTotal)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by customer name..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-400" />
                    <input
                        type="date"
                        className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500/20 text-gray-600 dark:text-gray-300"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center font-medium text-gray-500">Loading sales history...</div>
            ) : (
                <Table headers={['Sale ID', 'Customer', 'Items', 'Total', 'Time', 'Actions']}>
                    {sales.map((sale) => (
                        <tr key={sale._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-gray-500 uppercase">
                                #{sale._id.slice(-6)}
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-semibold text-gray-900 dark:text-white">{sale.customerName}</div>
                                {sale.phone && <div className="text-xs text-gray-500">{sale.phone}</div>}
                            </td>
                            <td className="px-6 py-4">
                                <Badge color="blue">{sale.items.length} Items</Badge>
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(sale.totalAmount)}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => navigate(`/orders/${sale._id}`)}
                                    className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary-600 shadow-sm border border-transparent hover:border-gray-200"
                                >
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {sales.length === 0 && (
                        <tr>
                            <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                No sales found for this date.
                            </td>
                        </tr>
                    )}
                </Table>
            )}
        </div>
    );
};

export default SalesHistory;
