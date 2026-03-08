import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Trash2,
    Save,
    ShoppingBag,
    User,
    Phone,
    MapPin,
    Printer,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import ProductAutocomplete from '../components/common/ProductAutocomplete';
import { formatCurrency } from '../utils/currency';

const Sales = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const printRef = useRef();

    const initialForm = {
        customerName: 'Walk-in Customer',
        phone: '',
        address: '',
        items: [{ productName: '', category: '', quantity: 1, price: 0, unit: 'Unit' }],
        type: 'DirectSale',
        orderStatus: 'Delivered',
        paymentStatus: 'Paid'
    };

    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [completedSale, setCompletedSale] = useState(null);

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
            category: product.category?.name || 'General',
            unit: product.unit || 'Unit',
            kg: 0,
            g: 0
        };
        setForm(prev => ({ ...prev, items }));
    };

    const addItem = () => {
        setForm(prev => ({
            ...prev,
            items: [...prev.items, { productName: '', category: '', quantity: 1, price: 0, unit: 'Unit' }]
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
        if (form.items.some(item => !item.productName || item.quantity <= 0)) {
            addToast('Please fill in all product details correctly.', 'error');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/orders', form);
            setCompletedSale(data);
            setShowReceipt(true);
            addToast('Sale completed successfully!', 'success');
        } catch (error) {
            console.error('Error completing sale', error);
            addToast('Failed to complete sale. Please check your inputs.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm(initialForm);
        setShowReceipt(false);
        setCompletedSale(null);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShoppingBag className="text-primary-500" />
                        Direct Sales & Billing
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quickly generate bills for walk-in customers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="secondary" onClick={resetForm}>
                        <RefreshCw size={18} className="mr-2" /> New Sale
                    </Button>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Current Date</p>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
                <div className="lg:col-span-2 space-y-6">
                    <Card
                        title="Billing Items"
                        badge={
                            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                                <Plus size={16} className="mr-1" /> Add Item
                            </Button>
                        }
                    >
                        <div className="space-y-3">
                            {form.items.map((item, index) => (
                                <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-all group">
                                    <div className="flex-grow min-w-[200px]">
                                        <ProductAutocomplete
                                            label="Select Product"
                                            placeholder="Search by name..."
                                            value={item.productName}
                                            onChange={(e) => handleItemChange(index, e)}
                                            onSelect={(product) => handleProductSelect(index, product)}
                                            required
                                        />
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
                                            value={item.price}
                                            onChange={(e) => handleItemChange(index, e)}
                                            required
                                        />
                                    </div>
                                    <div className="w-32 text-right self-center pt-6">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Subtotal</p>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(item.price * item.quantity)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors mb-1"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Customer Info (Optional)">
                        <div className="space-y-4">
                            <Input
                                label="Customer Name"
                                name="customerName"
                                placeholder="Walk-in Customer"
                                value={form.customerName}
                                onChange={handleInputChange}
                                icon={<User size={18} />}
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                placeholder="07x xxxx xxx"
                                value={form.phone}
                                onChange={handleInputChange}
                                icon={<Phone size={18} />}
                            />
                        </div>
                    </Card>

                    <Card className="bg-primary-500 text-white border-none shadow-xl shadow-primary-500/20">
                        <div className="space-y-4 py-2">
                            <div className="flex justify-between items-center opacity-80">
                                <span>Bill Summary</span>
                                <span>{form.items.length} Items</span>
                            </div>
                            <div className="h-px bg-white/20" />
                            <div className="flex justify-between items-baseline">
                                <span className="text-lg">Total Amount</span>
                                <span className="text-4xl font-black">{formatCurrency(calculateTotal())}</span>
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-primary-600 hover:bg-gray-100 py-4 text-lg font-bold shadow-lg"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        <Save size={20} className="mr-2" />
                                        Complete Sale
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>
            </form>

            <Modal
                isOpen={showReceipt}
                onClose={() => setShowReceipt(false)}
                title="Sale Completed"
                footer={
                    <div className="flex gap-2 w-full">
                        <Button variant="secondary" className="flex-1" onClick={handlePrint}>
                            <Printer size={18} className="mr-2" /> Print Bill
                        </Button>
                        <Button className="flex-1" onClick={resetForm}>
                            New Sale
                        </Button>
                    </div>
                }
            >
                {completedSale && (
                    <div className="text-center space-y-4 py-2" id="printable-bill">
                        <div className="flex justify-center mb-2">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 size={32} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider">Nirosha Sweet House</h3>
                            <p className="text-sm text-gray-500">Bill No: #{completedSale._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-400">{new Date(completedSale.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-800 my-4" />

                        <div className="space-y-2 text-left">
                            {completedSale.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {item.productName} x {item.quantity}
                                    </span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-800 my-4" />

                        <div className="flex justify-between items-center py-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-white uppercase">Total</span>
                            <span className="text-2xl font-black text-primary-600">{formatCurrency(completedSale.totalAmount)}</span>
                        </div>

                        <p className="text-xs text-gray-500 mt-6">Thank you for your business!</p>
                        <p className="text-[10px] text-gray-400">Visit us again</p>

                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @media print {
                                /* Hide everything by default */
                                body { 
                                    visibility: hidden; 
                                    background: white !important;
                                }
                                
                                /* Show the bill and all its children */
                                #printable-bill, #printable-bill * { 
                                    visibility: visible !important; 
                                    color: black !important;
                                }
                                
                                /* Position the bill at the top-left of the printed page */
                                #printable-bill { 
                                    position: absolute; 
                                    left: 0; 
                                    top: 0; 
                                    width: 100%; 
                                    margin: 0;
                                    padding: 20px;
                                    background: white !important;
                                }

                                /* Remove scroll limits and fixed positioning that break printing */
                                .overflow-y-auto { overflow: visible !important; max-height: none !important; }
                                .fixed, .absolute { position: static !important; }
                                
                                /* Explicitly hide UI elements that might stay visible */
                                .print\\:hidden, button, .bg-gray-950\\/40 { display: none !important; }
                            }
                        ` }} />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Sales;
