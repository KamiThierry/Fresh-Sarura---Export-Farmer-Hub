import { useState, useEffect } from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import logo from '../../../assets/sarura_logo_nav.png';
import ThemeToggle from '../../shared/component/ThemeToggle';
import NotificationsModal from '../../shared/component/NotificationsModal';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';

const Header = () => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const navigate = useNavigate();

    // Real user from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { name: 'User', role: 'Staff' };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`, {});
            fetchNotifications();
        } catch (err) { console.error(err); }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all', {});
            fetchNotifications();
        } catch (err) { console.error(err); }
    };

    const handleClearAll = async () => {
        try {
            await api.delete('/notifications');
            fetchNotifications();
        } catch (err) { console.error(err); }
    };

    const formatRole = (role: string) => {
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

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
                        className={`relative p-2.5 rounded-xl transition-all shadow-sm ${
                            unreadCount > 0 
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                : 'bg-white/80 dark:bg-gray-700/50 text-gray-500 dark:text-gray-200 hover:bg-blue-500 hover:text-white'
                        }`}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-blue-600 rounded-full text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* User Avatar & Profile */}
                    <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-[#222222] dark:text-white">{user.name}</p>
                            <p className="text-xs text-[#6B7280] dark:text-gray-400">{formatRole(user.role)}</p>
                        </div>
                        <button
                            onClick={() => navigate('/logistics/settings')}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
                            title="My Profile & Settings"
                        >
                            {user.name.charAt(0).toUpperCase()}
                        </button>
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
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearAll={handleClearAll}
            />
        </>
    );
};

export default Header;
