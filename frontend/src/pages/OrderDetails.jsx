import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Printer,
    Trash2,
    CheckCircle,
    Clock,
    Truck,
    Package,
    XCircle,
    ChevronDown
} from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/currency';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus) => {
        try {
            await api.patch(`/orders/${id}/status`, { orderStatus: newStatus });
            addToast(`Order status updated to ${newStatus}`, 'success');
            fetchOrder();
        } catch (error) {
            console.error('Error updating status', error);
            addToast('Failed to update status', 'error');
        }
    };

    if (loading) return <div className="py-20 text-center dark:text-gray-400">Loading order details...</div>;
    if (!order) return <div className="py-20 text-center dark:text-gray-400">Order not found.</div>;

    const statusColors = {
        Pending: 'yellow',
        Confirmed: 'blue',
        Preparing: 'pink',
        Delivered: 'green',
        Cancelled: 'red',
    };

    const statusIcons = {
        Pending: <Clock size={16} />,
        Confirmed: <CheckCircle size={16} />,
        Preparing: <Package size={16} />,
        Delivered: <Truck size={16} />,
        Cancelled: <XCircle size={16} />,
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            Order #{order._id.slice(-6).toUpperCase()}
                            <Badge color={statusColors[order.orderStatus]}>{order.orderStatus}</Badge>
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="secondary"><Printer size={18} className="mr-2" /> Print Invoice</Button>
                    <div className="relative group">
                        <Button>Update Status <ChevronDown size={18} className="ml-2" /></Button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                            {Object.keys(statusColors).map(status => (
                                <button
                                    key={status}
                                    onClick={() => updateStatus(status)}
                                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors dark:text-gray-300"
                                >
                                    {statusIcons[status]}
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Order Items">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                                        <th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                                        <th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Price</th>
                                        <th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {order.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{item.productName}</div>
                                                <div className="text-xs text-gray-500">{item.category}</div>
                                            </td>
                                            <td className="py-4 text-center dark:text-gray-300">{item.quantity}</td>
                                            <td className="py-4 text-right dark:text-gray-300">{formatCurrency(item.price)}</td>
                                            <td className="py-4 text-right font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(item.price * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(order.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Tax (0%)</span>
                                    <span>{formatCurrency(0)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <span>Total</span>
                                    <span className="text-primary-600">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Order Timeline">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center z-10">
                                        <CheckCircle size={16} />
                                    </div>
                                    <div className="w-0.5 flex-1 bg-gray-100 dark:bg-gray-800 my-1"></div>
                                </div>
                                <div className="pb-6">
                                    <h4 className="font-bold text-gray-900 dark:text-white">Order Placed</h4>
                                    <p className="text-sm text-gray-500">System received the order successfully.</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            {/* Add more timeline items based on history if available */}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Customer Details">
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Name</p>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">{order.customerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">{order.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
                                <p className="font-medium text-gray-900 dark:text-white mt-1 leading-relaxed">
                                    {order.address}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Schedule Info">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Delivery Date</p>
                                    <p className="font-medium dark:text-white">{order.scheduleDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-lg">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Delivery Time</p>
                                    <p className="font-medium dark:text-white">{order.scheduleTime}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Payment Status">
                        <div className="flex items-center justify-between">
                            <Badge color={order.paymentStatus === 'Paid' ? 'green' : 'red'}>
                                {order.paymentStatus}
                            </Badge>
                            <button className="text-xs text-primary-600 hover:underline font-medium">Mark as Paid</button>
                        </div>
                    </Card>

                    <button className="w-full py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl border border-dashed border-red-200 dark:border-red-900/30 font-medium transition-colors flex items-center justify-center gap-3">
                        <Trash2 size={18} />
                        Cancel Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
