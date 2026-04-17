import { useState, useEffect, useRef } from 'react';
import { Leaf, Search, Bell, Loader2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../shared/component/ThemeToggle';
import NotificationsModal from '../../shared/component/NotificationsModal';
import { api } from '@/lib/api';
import { useFarmManager } from '../../../lib/useFarmManager';
import { useFMSearch } from '@/lib/useGlobalSearch';

// --- Type badge colours ---
const TYPE_COLOURS: Record<string, string> = {
    'Crop Cycle':   'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    'Forecast':     'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    'Field Report': 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
};

const FarmManagerHeader = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Pull live data from context for search
    const { cycles, forecasts, fieldReports } = useFarmManager();
    const searchResults = useFMSearch(searchQuery, cycles, forecasts, fieldReports);

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

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try { setCurrentUser(JSON.parse(userStr)); } catch (e) { console.error(e); }
        }
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const initials = currentUser?.name
        ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'FM';

    return (
        <header className="fixed top-[10px] left-[10px] right-[10px] h-16 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 z-40 px-6 flex items-center justify-between transition-colors duration-300 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-900/20">
                    <Leaf className="text-white" size={18} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-base font-bold text-green-700 dark:text-green-500 tracking-tight">Fresh Sarura</h1>
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Export &amp; Farmer Hub</p>
                </div>
            </div>

            {/* Centered Search Box */}
            <div className="flex-1 max-w-md mx-8 hidden md:block">
                <div className="relative" ref={dropdownRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            setIsDropdownOpen(e.target.value.length >= 2);
                        }}
                        onFocus={() => setIsDropdownOpen(searchQuery.length >= 2)}
                        placeholder="Search cycles, forecasts, reports..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F6F0] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#66BB6A] text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                    />

                    {/* Live Results Dropdown */}
                    {isDropdownOpen && searchQuery.length >= 2 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                            {searchResults.length > 0 ? (
                                <ul>
                                    {searchResults.map(result => (
                                        <li
                                            key={result.id}
                                            onClick={() => { navigate(result.url); setSearchQuery(''); setIsDropdownOpen(false); }}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                                        >
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${TYPE_COLOURS[result.type] ?? 'bg-gray-100 text-gray-500'}`}>
                                                        {result.type}
                                                    </span>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{result.title}</p>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{result.subtitle}</p>
                                            </div>
                                            {result.badge && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 shrink-0 capitalize">
                                                    {result.badge}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No results for "<span className="font-semibold text-gray-700 dark:text-gray-300">{searchQuery}</span>"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-2">
                <ThemeToggle />

                {/* Notification Icon */}
                <button
                    onClick={() => setIsNotificationsOpen(true)}
                    className="relative p-2.5 rounded-xl bg-white/80 hover:bg-[#4CAF50] hover:text-white transition-all shadow-sm dark:bg-gray-700/50 dark:text-gray-200 dark:hover:bg-green-600"
                >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-green-600 rounded-full text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800 animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {/* User Avatar — click goes to settings */}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-[#222222] dark:text-white">
                            {currentUser?.name || 'Farm Manager'}
                        </p>
                        <p className="text-xs text-[#6B7280] dark:text-gray-400">Field Ops</p>
                    </div>
                    <button
                        onClick={() => navigate('/farm-manager/settings')}
                        title="My Profile & Settings"
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-white text-sm font-semibold shadow-md hover:saturate-150 transition-all active:scale-95"
                    >
                        {initials}
                    </button>
                    <button
                        onClick={handleLogout}
                        title="Sign out"
                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <LogOut size={16} />
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

export default FarmManagerHeader;
