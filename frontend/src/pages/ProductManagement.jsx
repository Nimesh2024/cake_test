import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Save, X } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/currency';

const ProductManagement = () => {
    const { addToast } = useToast();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        productName: '',
        category: '',
        price: '',
        costPrice: '',
        stockQuantity: '',
        expiryDate: '',
        unit: 'Unit',
        status: 'Active',
        image: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [searchTerm, categoryFilter]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/products', {
                params: { search: searchTerm, category: categoryFilter }
            });
            setProducts(data);
        } catch (error) {
            addToast('Failed to fetch products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/products/${formData._id}`, formData);
                addToast('Product updated successfully', 'success');
            } else {
                await api.post('/products', formData);
                addToast('Product created successfully', 'success');
            }
            fetchProducts();
            handleCloseModal();
        } catch (error) {
            addToast(error.response?.data?.message || 'Error saving product', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            addToast('Product deleted successfully', 'success');
            fetchProducts();
        } catch (error) {
            addToast('Failed to delete product', 'error');
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setFormData({ ...product, category: product.category._id });
            setIsEditing(true);
        } else {
            setFormData({
                productName: '',
                category: '',
                price: '',
                costPrice: '',
                stockQuantity: '',
                expiryDate: '',
                unit: 'Unit',
                status: 'Active',
                image: ''
            });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Product Management</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage your inventory products</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={18} className="mr-2" /> Add Product
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400" size={18} />
                    <select
                        className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500/20 text-gray-600 dark:text-gray-300"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center font-medium text-gray-500">Loading products...</div>
            ) : (
                <Table headers={['Product', 'Category', 'Price/Unit', 'Stock', 'Status', 'Actions']}>
                    {products.map((prod) => (
                        <tr key={prod._id} className="dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-semibold">{prod.productName}</div>
                                {prod.image && <div className="text-[10px] text-primary-500">Has Image</div>}
                            </td>
                            <td className="px-6 py-4">
                                <Badge color="blue">{prod.category?.name || 'Unknown'}</Badge>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold">{formatCurrency(prod.price)} / {prod.unit || 'Unit'}</div>
                                <div className="text-[10px] text-gray-500">Cost: {formatCurrency(prod.costPrice)}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={prod.stockQuantity <= 5 ? 'text-red-500 font-bold' : ''}>
                                    {prod.stockQuantity} {prod.unit || 'Unit'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <Badge color={prod.status === 'Active' ? 'green' : 'red'}>
                                    {prod.status}
                                </Badge>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(prod)}
                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(prod._id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={isEditing ? 'Edit Product' : 'Add Product'}
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleSave}>
                            <Save size={18} className="mr-2" /> {isEditing ? 'Update' : 'Save'}
                        </Button>
                    </>
                }
            >
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            label="Product Name"
                            placeholder="e.g. Chocolate Truffle Cake"
                            value={formData.productName}
                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                        <select
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 text-gray-900 dark:text-white"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <Input
                        label="Price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                    />
                    <Input
                        label="Cost Price"
                        type="number"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                        required
                    />
                    <Input
                        label="Stock Quantity"
                        type="number"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                        required
                    />
                    <Input
                        label="Expiry Date"
                        type="date"
                        value={formData.expiryDate ? formData.expiryDate.split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Unit</label>
                        <select
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 text-gray-900 dark:text-white"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        >
                            <option value="Unit">Unit (Pcs)</option>
                            <option value="kg">kilogram (kg)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                        <select
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 text-gray-900 dark:text-white"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProductManagement;
