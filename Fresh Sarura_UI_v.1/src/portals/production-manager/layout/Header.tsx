import { useState, useRef, useEffect } from 'react';
import { Leaf, Search, Bell, Users, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle'; // Adjusted import path
import NotificationsModal from '../../shared/component/NotificationsModal';
import { api } from '@/lib/api';

// --- Mock Global Index ---
const searchIndex = [
    { id: 1, type: 'Farmer', title: 'Kirehe Co-op', subtitle: 'Gahara Sector', url: '/farmers', icon: Users },
    { id: 2, type: 'Batch', title: 'B-2026-001', subtitle: 'Avocado (Grade A) - Nature Pride', url: '/inventory', icon: Package },
    { id: 3, type: 'Farmer', title: 'Jean Claude', subtitle: 'Rwimiyaga Sector', url: '/farmers', icon: Users },
    { id: 4, type: 'QC', title: 'Inspection 45', subtitle: 'Pending Review', url: '/quality-control', icon: Leaf },
];

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Get real user data
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { name: 'User', role: 'Staff' };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) { console.error(err); }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            fetchNotifications();
        } catch (err) { console.error(err); }
    };

    const handleClearAll = async () => {
        try {
            await api.delete('/notifications');
            fetchNotifications();
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const formatRole = (role: string) => {
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Filter logic
    const filteredResults = searchIndex.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (url: string) => {
        setSearchQuery('');
        setIsDropdownOpen(false);
        navigate(url); // Assumes you have React Router setup. Modify if you use different navigation.
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <header className="fixed top-[10px] left-[10px] right-[10px] h-16 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border-theme z-40 px-6 flex items-center justify-between transition-colors duration-300 rounded-2xl shadow-floating">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-900/20">
                    <Leaf className="text-white" size={18} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-base font-bold text-green-700 dark:text-green-500 tracking-tight">Fresh Sarura</h1>
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Export & Farmer Hub</p>
                </div>
            </div>

            {/* Centered Search Box */}
            <div className="flex-1 max-w-md mx-8">
                <div className="relative" ref={dropdownRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsDropdownOpen(e.target.value.length > 0);
                        }}
                        onFocus={() => setIsDropdownOpen(searchQuery.length > 0)}
                        placeholder="Search batches, farmers, exports..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F6F0] border-theme focus:outline-none focus:ring-2 focus:ring-[#66BB6A] text-sm dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                    />

                    {/* Quick Look Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                            {filteredResults.length > 0 ? (
                                <ul>
                                    {filteredResults.map((result) => (
                                        <li
                                            key={result.id}
                                            onClick={() => handleResultClick(result.url)}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                                                <result.icon size={16} className="text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{result.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                    <span className="font-semibold">{result.type}</span> • {result.subtitle}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No results found for "<span className="font-semibold text-gray-700 dark:text-gray-300">{searchQuery}</span>"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3">
                <ThemeToggle />

                {/* Notification Icon */}
                <button 
                    onClick={() => setIsNotificationsOpen(true)}
                    className="relative p-2.5 rounded-xl bg-white/80 hover:bg-[#4CAF50] hover:text-white transition-all shadow-sm dark:bg-gray-700/50 dark:text-gray-200 dark:hover:bg-green-600"
                >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-green-600 rounded-full text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
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
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-white text-sm font-semibold shadow-md hover:saturate-150 transition-all active:scale-95"
                        title="Click to logout"
                    >
                        {user.name.charAt(0).toUpperCase()}
                    </button>
                </div>
            </div>

            <NotificationsModal 
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearAll={handleClearAll}
            />
        </header>
    );
};

export default Header;
