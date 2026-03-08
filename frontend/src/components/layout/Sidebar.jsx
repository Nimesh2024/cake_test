import {
    LayoutDashboard,
    PlusCircle,
    ShoppingBag,
    History,
    Settings,
    LogOut,
    Package,
    Layers,
    Users,
    Truck,
    BarChart3
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
        { icon: <ShoppingBag size={20} />, label: 'Direct Sales', path: '/sales' },
        { icon: <History size={20} />, label: 'Sales History', path: '/sales-history' },
        { icon: <PlusCircle size={20} />, label: 'New Order', path: '/orders/new' },
        { icon: <ShoppingBag size={20} />, label: 'Orders', path: '/orders' },
        { icon: <Package size={20} />, label: 'Products', path: '/products' },
        { icon: <Layers size={20} />, label: 'Categories', path: '/categories' },
        { icon: <Package size={20} />, label: 'Inventory', path: '/inventory' },
        { icon: <Truck size={20} />, label: 'Supply History', path: '/supplies' },
        { icon: <Users size={20} />, label: 'Wholesalers', path: '/suppliers' },
        {
            icon: <BarChart3 size={20} />,
            label: 'Reports',
            path: '/reports',
            roles: ['Admin']
        },
        {
            icon: <Users size={20} />,
            label: 'Users',
            path: '/users',
            roles: ['Admin']
        },
        { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
    ];

    const filteredItems = menuItems.filter(item =>
        !item.roles || item.roles.includes(user?.role)
    );

    return (
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-[calc(100vh-64px)] overflow-y-auto transition-colors">
            <div className="flex-1 py-6 px-4">
                <ul className="space-y-2">
                    {filteredItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}
                `}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors font-semibold"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
