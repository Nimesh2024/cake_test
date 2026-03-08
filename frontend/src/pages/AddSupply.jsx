import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ShoppingCart, Calculator } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { formatCurrency } from '../utils/currency';

const AddSupply = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        supplier: '',
        suppliedItems: [{ product: '', quantity: '', costPrice: '' }],
        paymentStatus: 'Unpaid',
        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [supRes, prodRes] = await Promise.all([
                    api.get('/suppliers'),
                    api.get('/products')
                ]);
                setSuppliers(supRes.data);
                setProducts(prodRes.data);
            } catch (error) {
                addToast('Error fetching data', 'error');
            }
        };
        fetchData();
    }, []);

    const addItem = () => {
        setFormData({
            ...formData,
            suppliedItems: [...formData.suppliedItems, { product: '', quantity: '', costPrice: '' }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.suppliedItems.filter((_, i) => i !== index);
        setFormData({ ...formData, suppliedItems: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.suppliedItems];
        newItems[index][field] = value;

        // Auto-fill cost price if product is selected
        if (field === 'product' && value) {
            const selectedProd = products.find(p => p._id === value);
            if (selectedProd) {
                newItems[index].costPrice = selectedProd.costPrice || 0;
            }
        }

        setFormData({ ...formData, suppliedItems: newItems });
    };

    const calculateTotal = () => {
        return formData.suppliedItems.reduce((acc, item) => {
            return acc + (Number(item.quantity || 0) * Number(item.costPrice || 0));
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.supplier) return addToast('Please select a supplier', 'error');
        if (formData.suppliedItems.some(i => !i.product || !i.quantity || !i.costPrice)) {
            return addToast('Please fill all item details', 'error');
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                totalCost: calculateTotal()
            };
            await api.post('/supplies', payload);
            addToast('Supply record added successfully', 'success');
            navigate('/supplies');
        } catch (error) {
            addToast('Failed to add supply record', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Record New Supply</h2>
                    <p className="text-gray-500 dark:text-gray-400">Add products received from wholesalers</p>
                </div>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold dark:text-gray-300">Wholesaler / Supplier</label>
                            <select
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white"
                                value={formData.supplier}
                                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(sup => (
                                    <option key={sup._id} value={sup._id}>{sup.supplierName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold dark:text-gray-300">Payment Status</label>
                            <select
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white"
                                value={formData.paymentStatus}
                                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                            >
                                <option value="Unpaid">Unpaid</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                <ShoppingCart size={20} className="text-primary-500" /> Supplied Items
                            </h3>
                            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                                <Plus size={16} className="mr-1" /> Add Item
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {formData.suppliedItems.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl relative">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product</label>
                                        <select
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white"
                                            value={item.product}
                                            onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                                        >
                                            <option value="">Select Product</option>
                                            {products.map(prod => (
                                                <option key={prod._id} value={prod._id}>{prod.productName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qty</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Cost</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white"
                                                value={item.costPrice}
                                                onChange={(e) => handleItemChange(index, 'costPrice', e.target.value)}
                                                placeholder="0.00"
                                            />
                                            {formData.suppliedItems.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 p-4 bg-primary-50/50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/30">
                            <div className="p-3 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/20">
                                <Calculator size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">Total Valuation</p>
                                <h4 className="text-2xl font-black text-primary-700 dark:text-primary-300">{formatCurrency(calculateTotal())}</h4>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <Button variant="secondary" className="flex-1 md:flex-none" onClick={() => navigate('/supplies')}>Cancel</Button>
                            <Button type="submit" className="flex-1 md:flex-none" disabled={loading}>
                                <Save size={18} className="mr-2" /> {loading ? 'Saving...' : 'Record Supply'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AddSupply;
