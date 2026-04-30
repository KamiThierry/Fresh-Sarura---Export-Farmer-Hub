import { useState } from 'react';
import { Search, Bell, LogOut, ChevronDown } from 'lucide-react';
import logo from '@/assets/sarura_logo_nav.png';
import ThemeToggle from '../../shared/component/ThemeToggle';
import NotificationsModal from '../components/NotificationsModal';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const navigate = useNavigate();

    // Real user from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { name: 'User', role: 'Staff' };

    const formatRole = (role: string) => {
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <>
            <header className="fixed top-[10px] left-[10px] right-[10px] h-16 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 z-40 px-6 flex items-center justify-between transition-colors duration-300 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Fresh Sarura" className="h-10 w-auto" />
                    <div>
                        <h1 className="text-base font-bold text-green-700 dark:text-green-500 tracking-tight">Fresh Sarura</h1>
                        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Export &amp; Farmer Hub</p>
                    </div>
                </div>

                {/* Centered Search Box */}
                <div className="flex-1 max-w-md mx-8 hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search shipments, drivers, routes..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F6F0] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    {/* Notification Bell */}
                    <button
                        onClick={() => setIsNotificationsOpen(true)}
                        className="relative p-2.5 rounded-xl bg-white/80 hover:bg-blue-500 hover:text-white transition-all shadow-sm dark:bg-gray-700/50 dark:text-gray-200 dark:hover:bg-blue-600"
                    >
                        <Bell size={18} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                    </button>

                    {/* User Avatar & Profile */}
                    <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700">
                        <div onClick={() => navigate('/logistics/settings')} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-1 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-white text-sm font-bold shadow-md hover:saturate-150 transition-all active:scale-95">
                                {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">{formatRole(user.role)}</p>
                            </div>
                            <ChevronDown size={14} className="text-gray-400 ml-1" />
                        </div>
                        {/* Separate logout button */}
                        <button
                            onClick={handleLogout}
                            title="Sign out"
                            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            <NotificationsModal
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
        </>
    );
};

export default Header;
