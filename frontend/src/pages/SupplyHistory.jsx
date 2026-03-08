import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Truck, Calendar, DollarSign } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/currency';

const SupplyHistory = () => {
    const { addToast } = useToast();
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSupplies();
    }, []);

    const fetchSupplies = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/supplies');
            setSupplies(data);
        } catch (error) {
            addToast('Failed to fetch supply history', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Supply History</h2>
                    <p className="text-gray-500 dark:text-gray-400">Track all wholesale stock movements</p>
                </div>
                <Link to="/supplies/add">
                    <Button>Record Supply</Button>
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                <Search className="text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by supplier name..."
                    className="flex-1 bg-transparent border-none outline-none dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-20 text-center font-medium text-gray-500">Loading history...</div>
            ) : (
                <Table headers={['Wholesaler', 'Supplied Products', 'Total Cost', 'Date', 'Payment', 'Actions']}>
                    {supplies
                        .filter(s => s.supplier?.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((supply) => (
                            <tr key={supply._id} className="dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 font-bold">{supply.supplier?.supplierName}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex flex-wrap gap-1">
                                            {supply.suppliedItems.slice(0, 2).map((item, idx) => {
                                                const name = item.product?.productName || (typeof item.product === 'string' ? `ID: ${item.product.substring(0, 6)}...` : 'Unknown Product');
                                                return (
                                                    <span key={idx} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {name}{idx < Math.min(supply.suppliedItems.length, 2) - 1 ? ',' : ''}
                                                    </span>
                                                );
                                            })}
                                            {supply.suppliedItems.length > 2 && (
                                                <span className="text-xs text-gray-500 font-medium self-center">
                                                    + {supply.suppliedItems.length - 2} more items
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                                            {supply.suppliedItems.reduce((acc, item) => acc + item.quantity, 0)} Total Units
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-black text-primary-600">
                                    {formatCurrency(supply.totalCost)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                    {new Date(supply.supplyDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge color={supply.paymentStatus === 'Paid' ? 'green' : 'yellow'}>
                                        {supply.paymentStatus}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm" className="hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 rounded-xl">
                                        <Eye size={18} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                </Table>
            )}
        </div>
    );
};

export default SupplyHistory;
