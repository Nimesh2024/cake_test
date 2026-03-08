import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Trash2,
    ArrowLeft,
    Save,
    Check
} from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import ProductAutocomplete from '../components/common/ProductAutocomplete';
import { formatCurrency } from '../utils/currency';

const CATEGORIES = ['Cake', 'Sweet', 'Gift Item', 'Biscuit', 'Chocolate'];

const CreateOrder = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [form, setForm] = useState({
        customerName: '',
        phone: '',
        address: '',
        items: [{ productName: '', category: 'Cake', quantity: 1, price: 0 }],
        scheduleDate: '',
        scheduleTime: '',
        paymentStatus: 'Unpaid'
    });

    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const items = [...form.items];
        items[index][name] = name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value;
        setForm(prev => ({ ...prev, items }));
    };

    const handleProductSelect = (index, product) => {
        const items = [...form.items];
        items[index] = {
            ...items[index],
            productName: product.productName,
            price: product.price,
            // Map 'Gift' to 'Gift Item' if necessary for the dropdown
            category: product.category?.name === 'Gift' ? 'Gift Item' : product.category?.name || 'Cake',
            unit: product.unit || 'Unit',
            kg: 0,
            g: 0
        };
        setForm(prev => ({ ...prev, items }));
    };

    const addItem = () => {
        setForm(prev => ({
            ...prev,
            items: [...prev.items, { productName: '', category: 'Cake', quantity: 1, price: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (form.items.length === 1) return;
        const items = [...form.items];
        items.splice(index, 1);
        setForm(prev => ({ ...prev, items }));
    };

    const calculateTotal = () => {
        return form.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/orders', form);
            addToast('Order created successfully!', 'success');
            navigate('/orders');
        } catch (error) {
            console.error('Error creating order', error);
            addToast('Failed to create order. Please check your inputs.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/orders')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Order</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the details to place a new order.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Customer Information">
                        <div className="space-y-4">
                            <Input
                                label="Customer Name"
                                name="customerName"
                                placeholder="Enter customer name"
                                value={form.customerName}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                label="Phone Number"
                                name="phone"
                                placeholder="077 123 4567"
                                value={form.phone}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                label="Address"
                                name="address"
                                placeholder="Colombo, Sri Lanka"
                                value={form.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </Card>

                    <Card title="Schedule & Payment">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Delivery Date"
                                    name="scheduleDate"
                                    type="date"
                                    value={form.scheduleDate}
                                    onChange={handleInputChange}
                                    required
                                />
                                <Input
                                    label="Delivery Time"
                                    name="scheduleTime"
                                    type="time"
                                    value={form.scheduleTime}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
                                <select
                                    name="paymentStatus"
                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20"
                                    value={form.paymentStatus}
                                    onChange={handleInputChange}
                                >
                                    <option value="Unpaid">Unpaid</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card title="Order Items" badge={<Button type="button" variant="secondary" size="sm" onClick={addItem}><Plus size={16} className="mr-1" /> Add Item</Button>}>
                    <div className="space-y-4">
                        {form.items.map((item, index) => (
                            <div key={index} className="flex flex-wrap gap-4 items-end p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800 relative group">
                                <div className="flex-1 min-w-[200px]">
                                    <ProductAutocomplete
                                        label="Product Name"
                                        placeholder="e.g. Chocolate Cake"
                                        value={item.productName}
                                        onChange={(e) => handleItemChange(index, e)}
                                        onSelect={(product) => handleProductSelect(index, product)}
                                        required
                                    />
                                </div>
                                <div className="w-40">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                                    <select
                                        name="category"
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                                        value={item.category}
                                        onChange={(e) => handleItemChange(index, e)}
                                    >
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>

                                {item.unit === 'kg' ? (
                                    <>
                                        <div className="w-24">
                                            <Input
                                                label="kg"
                                                name="kg"
                                                type="number"
                                                min="0"
                                                value={item.kg || 0}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    const items = [...form.items];
                                                    items[index].kg = val;
                                                    items[index].quantity = val + (items[index].g || 0) / 1000;
                                                    setForm(prev => ({ ...prev, items }));
                                                }}
                                                required
                                            />
                                        </div>
                                        <div className="w-24">
                                            <Input
                                                label="grams (g)"
                                                name="g"
                                                type="number"
                                                min="0"
                                                max="999"
                                                value={item.g || 0}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    const items = [...form.items];
                                                    items[index].g = val;
                                                    items[index].quantity = (items[index].kg || 0) + val / 1000;
                                                    setForm(prev => ({ ...prev, items }));
                                                }}
                                                required
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-24">
                                        <Input
                                            label="Qty"
                                            name="quantity"
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, e)}
                                            required
                                        />
                                    </div>
                                )}

                                <div className="w-32">
                                    <Input
                                        label={item.unit === 'kg' ? "Price / kg" : "Price / Unit"}
                                        name="price"
                                        type="number"
                                        min="0"
                                        placeholder="2500"
                                        value={item.price}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors mb-0.5"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(calculateTotal())}
                        </h3>
                    </div>
                    <div className="flex gap-4">
                        <Button type="button" variant="secondary" onClick={() => navigate('/orders')}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="px-8">
                            {loading ? 'Processing...' : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    Place Order
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateOrder;
