import { useState, useEffect, useRef } from 'react';
import { Search, Bell, LogOut, Loader2 } from 'lucide-react';
import logo from '@/assets/sarura_logo_nav.png';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../production-manager/components/ThemeToggle';
import { api } from '../../../lib/api';
import NotificationsModal from '../../shared/component/NotificationsModal';
import { useUniversalSearch } from '@/lib/useGlobalSearch';

const TYPE_COLOURS: Record<string, string> = {
    'Batch': 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    'Intake': 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    'Farmer': 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
};

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Real user from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { name: 'User', role: 'quality_officer' };

    const { results: searchResults, loading: searchLoading } = useUniversalSearch(searchQuery, user.role);

    const formatRole = (role: string) => {
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

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
        // Refresh notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`, {});
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all', {});
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleClearAll = async () => {
        try {
            await api.delete('/notifications');
            fetchNotifications();
        } catch (err) {
            console.error('Failed to clear notifications:', err);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <header className="fixed top-[10px] left-[10px] right-[10px] h-16 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border-theme z-40 px-6 flex items-center justify-between transition-colors duration-300 rounded-2xl shadow-floating">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Fresh Sarura" className="h-10 w-auto" />
                    <div>
                        <h1 className="text-base font-bold text-green-700 dark:text-green-500 tracking-tight">Fresh Sarura</h1>
                        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Export & Farmer Hub</p>
                    </div>
                </div>

                {/* Centered Search Box */}
                <div className="flex-1 max-w-md mx-8">
                    <div className="relative" ref={dropdownRef}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-gray-400" size={18} />
                        {searchLoading && searchQuery.length >= 2 && (
                            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                        )}
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsDropdownOpen(e.target.value.length >= 2);
                            }}
                            onFocus={() => setIsDropdownOpen(searchQuery.length >= 2)}
                            placeholder="Search intakes, inspections, batches..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F6F0] border-theme focus:outline-none focus:ring-2 focus:ring-[#66BB6A] text-sm dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                        />

                        {/* Live Search Dropdown */}
                        {isDropdownOpen && searchQuery.length >= 2 && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                                {searchResults.length > 0 ? (
                                    <ul>
                                        {searchResults.map((result) => (
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
                                            </li>
                                        ))}
                                    </ul>
                                ) : !searchLoading ? (
                                    <div className="p-4 text-center text-sm text-gray-500">No results found</div>
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
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
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#4CAF50] text-white text-[9px] font-bold flex items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-800 animate-pulse">
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
                            onClick={() => navigate('/qc/settings')}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
                            title="My Profile & Settings"
                        >
                            {user.name.charAt(0).toUpperCase()}
                        </button>
                        {/* Separate logout button */}
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                navigate('/login');
                            }}
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
