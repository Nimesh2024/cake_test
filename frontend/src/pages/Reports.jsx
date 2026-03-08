import React, { useState, useEffect } from 'react';
import {
    Download,
    FileText,
    Calendar,
    Filter,
    ArrowUpRight,
    TrendingUp,
    PieChart as PieChartIcon
} from 'lucide-react';
import api from '../api/axios';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import { formatCurrency } from '../utils/currency';

const Reports = () => {
    const [salesData, setSalesData] = useState([]);
    const [staffPerformance, setStaffPerformance] = useState([]);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [salesRes, staffRes] = await Promise.all([
                api.get(`/reports/sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
                api.get('/reports/staff-performance')
            ]);
            setSalesData(salesRes.data);
            setStaffPerformance(staffRes.data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ["Date", "Orders", "Revenue"];
        const rows = salesData.map(d => [d._id, d.orderCount, d.totalRevenue]);
        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Financial Reports</h2>
                    <p className="text-gray-500 font-medium">Analyze sales performance and staff activity</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleExportCSV}>
                        <Download size={18} className="mr-2" /> Export CSV
                    </Button>
                    <Button onClick={() => window.print()}>
                        <FileText size={18} className="mr-2" /> Print Report
                    </Button>
                </div>
            </div>

            <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="space-y-2 flex-1">
                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Start Date</label>
                        <input
                            type="date"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2 flex-1">
                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">End Date</label>
                        <input
                            type="date"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        />
                    </div>
                    <Button variant="secondary" className="py-3 px-6 h-[46px]" onClick={fetchReports}>
                        <Filter size={18} className="mr-2" /> Apply Filters
                    </Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Sales History">
                    <Table headers={['Date', 'Orders', 'Revenue']}>
                        {salesData.map((day, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 font-medium">{day._id}</td>
                                <td className="px-6 py-4">{day.orderCount}</td>
                                <td className="px-6 py-4 font-bold text-primary-600">
                                    {formatCurrency(day.totalRevenue)}
                                </td>
                            </tr>
                        ))}
                    </Table>
                </Card>

                <Card title="Staff Performance">
                    <Table headers={['Staff Member', 'Orders', 'Total Sales']}>
                        {staffPerformance.map((staff, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{staff.name}</td>
                                <td className="px-6 py-4">{staff.orderCount}</td>
                                <td className="px-6 py-4 font-bold text-emerald-600">
                                    {formatCurrency(staff.totalSales)}
                                </td>
                            </tr>
                        ))}
                    </Table>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
