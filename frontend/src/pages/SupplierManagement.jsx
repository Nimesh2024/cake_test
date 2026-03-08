import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Phone, Mail, MapPin, Package } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import ProductAutocomplete from '../components/common/ProductAutocomplete';

const SupplierManagement = () => {
    const { addToast } = useToast();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSupplier, setCurrentSupplier] = useState({
        supplierName: '',
        phone: '',
        address: '',
        email: '',
        status: 'Active',
        suppliedProducts: []
    });
    const [isEditing, setIsEditing] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/suppliers');
            setSuppliers(data);
        } catch (error) {
            addToast('Failed to fetch suppliers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Send only IDs for suppliedProducts
            const payload = {
                ...currentSupplier,
                suppliedProducts: currentSupplier.suppliedProducts.map(p => p._id || p)
            };

            if (isEditing) {
                await api.put(`/suppliers/${currentSupplier._id}`, payload);
                addToast('Supplier updated successfully', 'success');
            } else {
                await api.post('/suppliers', payload);
                addToast('Supplier added successfully', 'success');
            }
            fetchSuppliers();
            setIsModalOpen(false);
        } catch (error) {
            addToast(error.response?.data?.message || 'Error saving supplier', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;
        try {
            await api.delete(`/suppliers/${id}`);
            addToast('Supplier deleted successfully', 'success');
            fetchSuppliers();
        } catch (error) {
            addToast('Failed to delete supplier', 'error');
        }
    };

    const handleOpenModal = (supplier = null) => {
        if (supplier) {
            setCurrentSupplier({
                ...supplier,
                suppliedProducts: supplier.suppliedProducts || []
            });
            setIsEditing(true);
        } else {
            setCurrentSupplier({
                supplierName: '',
                phone: '',
                address: '',
                email: '',
                status: 'Active',
                suppliedProducts: []
            });
            setIsEditing(false);
        }
        setProductSearch('');
        setIsModalOpen(true);
    };

    const addProduct = (product) => {
        if (currentSupplier.suppliedProducts.some(p => p._id === product._id)) {
            addToast('Product already added', 'warning');
            return;
        }
        setCurrentSupplier(prev => ({
            ...prev,
            suppliedProducts: [...prev.suppliedProducts, product]
        }));
        setProductSearch('');
    };

    const removeProduct = (productId) => {
        setCurrentSupplier(prev => ({
            ...prev,
            suppliedProducts: prev.suppliedProducts.filter(p => p._id !== productId)
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Wholesaler Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your product suppliers and their catalogs</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={18} className="mr-2" /> Add Wholesaler
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                <Input
                    placeholder="Search by name or contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                    noMargin
                />
            </div>

            {loading ? (
                <div className="py-20 text-center font-medium text-gray-500">Loading wholesalers...</div>
            ) : (
                <Table headers={['Wholesaler', 'Contact Details', 'Address', 'Supplied Products', 'Status', 'Actions']}>
                    {suppliers
                        .filter(s =>
                            s.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.phone.includes(searchTerm)
                        )
                        .map((sup) => (
                            <tr key={sup._id} className="dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 font-bold">{sup.supplierName}</td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Phone size={14} className="text-primary-500" /> {sup.phone}
                                        </div>
                                        {sup.email && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Mail size={14} className="text-primary-500" /> {sup.email}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm max-w-[200px] truncate group relative">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <MapPin size={14} className="flex-shrink-0" /> {sup.address || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                                        {sup.suppliedProducts?.length > 0 ? (
                                            sup.suppliedProducts.map(p => {
                                                const name = typeof p === 'object' ? p.productName : `ID: ${p.substring(0, 6)}...`;
                                                const id = typeof p === 'object' ? p._id : p;
                                                return (
                                                    <span key={id} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                                        {name}
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No products linked</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge color={sup.status === 'Active' ? 'green' : 'gray'}>
                                        {sup.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => handleOpenModal(sup)}
                                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-xl transition-all"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sup._id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-xl transition-all"
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
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? 'Edit Wholesaler' : 'Add New Wholesaler'}
                footer={
                    <div className="flex gap-3 w-full">
                        <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="flex-1">
                            <Save size={18} className="mr-2" /> {isEditing ? 'Update Wholesaler' : 'Save Wholesaler'}
                        </Button>
                    </div>
                }
            >
                <form className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">General Information</h4>
                        <Input
                            label="Wholesaler Name"
                            placeholder="e.g. Best Cake Supplies Co."
                            value={currentSupplier.supplierName}
                            onChange={(e) => setCurrentSupplier({ ...currentSupplier, supplierName: e.target.value })}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Phone Number"
                                placeholder="Contact number"
                                value={currentSupplier.phone}
                                onChange={(e) => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
                                required
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="email@example.com"
                                value={currentSupplier.email}
                                onChange={(e) => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                            />
                        </div>
                        <Input
                            label="Office Address"
                            placeholder="Full physical address"
                            value={currentSupplier.address}
                            onChange={(e) => setCurrentSupplier({ ...currentSupplier, address: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Package size={14} /> Supplied Products
                        </h4>

                        <ProductAutocomplete
                            placeholder="Search and add products..."
                            label="Add Product to Catalog"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            onSelect={addProduct}
                        />

                        <div className="flex flex-wrap gap-2 pt-2">
                            {currentSupplier.suppliedProducts.map((product) => {
                                const name = typeof product === 'object' ? product.productName : `ID: ${product.substring(0, 6)}...`;
                                const id = typeof product === 'object' ? product._id : product;
                                return (
                                    <div
                                        key={id}
                                        className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-xl border border-primary-100 dark:border-primary-800 text-sm font-semibold"
                                    >
                                        {name}
                                        <button
                                            type="button"
                                            onClick={() => removeProduct(id)}
                                            className="p-0.5 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-full"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                            {currentSupplier.suppliedProducts.length === 0 && (
                                <p className="text-sm text-gray-500 italic">No products associated yet</p>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Business Status</label>
                        <select
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 text-gray-900 dark:text-white transition-all"
                            value={currentSupplier.status}
                            onChange={(e) => setCurrentSupplier({ ...currentSupplier, status: e.target.value })}
                        >
                            <option value="Active">Active Partnership</option>
                            <option value="Inactive">Inactive/Paused</option>
                        </select>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SupplierManagement;
