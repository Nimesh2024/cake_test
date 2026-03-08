import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';

const CategoryManagement = () => {
    const { addToast } = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ name: '', description: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            addToast('Failed to fetch categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/categories/${currentCategory._id}`, currentCategory);
                addToast('Category updated successfully', 'success');
            } else {
                await api.post('/categories', currentCategory);
                addToast('Category created successfully', 'success');
            }
            fetchCategories();
            handleCloseModal();
        } catch (error) {
            addToast(error.response?.data?.message || 'Error saving category', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            addToast('Category deleted successfully', 'success');
            fetchCategories();
        } catch (error) {
            addToast('Failed to delete category', 'error');
        }
    };

    const handleOpenModal = (category = { name: '', description: '' }) => {
        setCurrentCategory(category);
        setIsEditing(!!category._id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCategory({ name: '', description: '' });
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Category Management</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage your shop categories</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={18} className="mr-2" /> Add Category
                </Button>
            </div>

            {loading ? (
                <div className="py-20 text-center font-medium text-gray-500">Loading categories...</div>
            ) : (
                <Table headers={['Name', 'Description', 'Actions']}>
                    {categories.map((cat) => (
                        <tr key={cat._id} className="dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 font-semibold">{cat.name}</td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{cat.description}</td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(cat)}
                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat._id)}
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
                title={isEditing ? 'Edit Category' : 'Add Category'}
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleSave}>
                            <Save size={18} className="mr-2" /> {isEditing ? 'Update' : 'Save'}
                        </Button>
                    </>
                }
            >
                <form className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold dark:text-white">Category Name</label>
                        <select
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white"
                            value={currentCategory.name}
                            onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            <option value="Cake">Cake</option>
                            <option value="Sweet">Sweet</option>
                            <option value="Chocolate">Chocolate</option>
                            <option value="Biscuit">Biscuit</option>
                            <option value="Gift">Gift</option>
                        </select>
                    </div>
                    <Input
                        label="Description"
                        placeholder="Short description..."
                        value={currentCategory.description}
                        onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                    />
                </form>
            </Modal>
        </div>
    );
};

export default CategoryManagement;
