import Logo from '../common/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Bell, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { darkMode, toggleDarkMode } = useTheme();
    const { user } = useAuth();

    return (
        <nav className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors">
            <Logo size="md" />

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
                </button>

                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                    <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold dark:text-gray-200">{user?.name || 'Guest'}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter font-bold">{user?.role || 'Visitor'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                        <UserIcon size={20} />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
