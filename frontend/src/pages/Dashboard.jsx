import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import StaffDashboard from './StaffDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'Admin') {
        return <AdminDashboard />;
    }

    return <StaffDashboard />;
};

export default Dashboard;
