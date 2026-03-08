import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, UserX, Mail, User as UserIcon, Loader2, Edit, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Staff'
    });
    const { addToast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
            addToast('Error fetching users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setFormData({ name: '', email: '', password: '', role: 'Staff' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setIsEditMode(true);
        setSelectedUserId(user._id);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Password optional on update
            role: user.role
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await api.put(`/users/${selectedUserId}`, formData);
                addToast('User updated successfully!', 'success');
            } else {
                await api.post('/users', formData);
                addToast('User created successfully!', 'success');
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            addToast(error.response?.data?.message || 'Error processing user', 'error');
        }
    };

    const toggleUserStatus = async (user) => {
        try {
            const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
            await api.patch(`/users/${user._id}/status`, { status: newStatus });
            addToast(`User ${newStatus === 'Active' ? 'enabled' : 'disabled'} successfully`, 'success');
            fetchUsers();
        } catch (error) {
            addToast('Error updating user status', 'error');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/users/${userId}`);
            addToast('User deleted successfully', 'success');
            fetchUsers();
        } catch (error) {
            addToast('Error deleting user', 'error');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">User Management</h2>
                    <p className="text-gray-500 font-medium">Internal secure access control</p>
                </div>
                <Button onClick={handleOpenCreateModal}>
                    <UserPlus className="mr-2" size={20} /> Add Staff
                </Button>
            </div>

            <Card>
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p className="font-bold tracking-widest text-xs uppercase">Loading System Users</p>
                    </div>
                ) : (
                    <Table headers={['User Details', 'Role', 'Status', 'Account Actions']}>
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-black">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge color={user.role === 'Admin' ? 'indigo' : 'blue'}>
                                        {user.role}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge color={user.status === 'Active' ? 'green' : 'red'}>
                                        {user.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenEditModal(user)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
                                            title="Edit User"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => toggleUserStatus(user)}
                                            className={`p-2 rounded-lg transition-colors ${user.status === 'Active' ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'}`}
                                            title={user.status === 'Active' ? 'Disable User' : 'Enable User'}
                                        >
                                            {user.status === 'Active' ? <UserX size={18} /> : <Shield size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-red-500 transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? 'Modify Staff Account' : 'Provision New Staff Account'}
            >
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <Input
                        label="Full Name"
                        placeholder="e.g. Ruwan Perera"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="ruwan@niroshasweets.lk"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <Input
                        label={isEditMode ? "Change Password (optional)" : "Password"}
                        type="password"
                        placeholder={isEditMode ? "Leave blank to keep current" : "Min 6 characters"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!isEditMode}
                    />
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Assign Role</label>
                        <select
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium dark:text-white"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="Staff">Staff (Operations Only)</option>
                            <option value="Admin">Admin (Full System Access)</option>
                        </select>
                    </div>
                    <div className="pt-6 flex gap-4">
                        <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1">
                            {isEditMode ? 'Update Account' : 'Create Account'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
