import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    History,
    Search,
    RefreshCw
} from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const InventoryDashboard = () => {
    const { addToast } = useToast();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [adjustmentData, setAdjustmentData] = useState({
        type: 'IN',
        quantity: '',
        reason: ''
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/inventory');
            setInventory(data);
        } catch (error) {
            addToast('Failed to fetch inventory', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdjust = async (e) => {
        e.preventDefault();
        try {
            await api.post('/inventory/adjust', {
                productId: selectedProduct._id,
                ...adjustmentData
            });
            addToast('Stock adjusted successfully', 'success');
            fetchInventory();
            setIsAdjustmentModalOpen(false);
            setAdjustmentData({ type: 'IN', quantity: '', reason: '' });
        } catch (error) {
            addToast(error.response?.data?.message || 'Error adjusting stock', 'error');
        }
    };

    const lowStockCount = inventory.filter(p => p.stockQuantity <= 5).length;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Inventory Dashboard</h2>
                    <p className="text-gray-500 dark:text-gray-400">Monitor and manage your stock levels</p>
                </div>
                <Button variant="secondary" onClick={fetchInventory}>
                    <RefreshCw size={18} className="mr-2" /> Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white dark:bg-gray-900 border-l-4 border-primary-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                            <h3 className="text-2xl font-bold dark:text-white">{inventory.length}</h3>
                        </div>
                        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl">
                            <History size={24} />
                        </div>
                    </div>
                </Card>
                <Card className={`bg-white dark:bg-gray-900 border-l-4 ${lowStockCount > 0 ? 'border-red-500' : 'border-green-500'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Alerts</p>
                            <h3 className="text-2xl font-bold dark:text-white">{lowStockCount}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${lowStockCount > 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-green-50 dark:bg-green-900/20 text-green-600'}`}>
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                </Card>
                <Card className="bg-white dark:bg-gray-900 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Stock Status</p>
                            <h3 className="text-2xl font-bold dark:text-white">Healthy</h3>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                            <RefreshCw size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {loading ? (
                <div className="py-20 text-center font-medium text-gray-500">Loading inventory...</div>
            ) : (
                <Table headers={['Product Name', 'Category', 'Current Stock', 'Status', 'Actions']}>
                    {inventory.map((prod) => (
                        <tr key={prod._id} className="dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 font-semibold">{prod.productName}</td>
                            <td className="px-6 py-4">
                                <Badge color="blue">{prod.category?.name}</Badge>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-lg font-bold">{prod.stockQuantity}</div>
                            </td>
                            <td className="px-6 py-4">
                                <Badge color={prod.stockQuantity <= 5 ? 'red' : 'green'}>
                                    {prod.stockQuantity <= 5 ? 'Low Stock' : 'Optimal'}
                                </Badge>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => {
                                            setSelectedProduct(prod);
                                            setIsAdjustmentModalOpen(true);
                                        }}
                                    >
                                        Adjust Stock
                                    </Button>
                                    <Button size="sm" variant="ghost">View History</Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>
            )}

            <Modal
                isOpen={isAdjustmentModalOpen}
                onClose={() => setIsAdjustmentModalOpen(false)}
                title={`Adjust Stock: ${selectedProduct?.productName}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsAdjustmentModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdjust}>Save Adjustment</Button>
                    </>
                }
            >
                <form className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold dark:text-white">Adjustment Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setAdjustmentData({ ...adjustmentData, type: 'IN' })}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${adjustmentData.type === 'IN' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 text-primary-600' : 'border-gray-100 dark:border-gray-800 text-gray-500'}`}
                            >
                                <ArrowUpRight size={18} /> Stock IN
                            </button>
                            <button
                                type="button"
                                onClick={() => setAdjustmentData({ ...adjustmentData, type: 'OUT' })}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${adjustmentData.type === 'OUT' ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600' : 'border-gray-100 dark:border-gray-800 text-gray-500'}`}
                            >
                                <ArrowDownRight size={18} /> Stock OUT
                            </button>
                        </div>
                    </div>
                    <Input
                        label="Quantity"
                        type="number"
                        placeholder="Enter amount..."
                        value={adjustmentData.quantity}
                        onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: e.target.value })}
                        required
                    />
                    <Input
                        label="Reason"
                        placeholder="e.g. New delivery, damaged item..."
                        value={adjustmentData.reason}
                        onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                        required
                    />
                </form>
            </Modal>
        </div>
    );
};

export default InventoryDashboard;
