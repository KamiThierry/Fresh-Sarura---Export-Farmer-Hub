import { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import logo from '@/assets/sarura_logo_nav.png';
import ThemeToggle from '../../shared/component/ThemeToggle';
import NotificationsModal from '../components/NotificationsModal';

const Header = () => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { name: 'Super Admin', role: 'admin' };
    const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'SA';

    const formatRole = (role: string) => {
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <>
            <header className="fixed top-[10px] left-[10px] right-[10px] h-16 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 z-40 px-6 flex items-center justify-between transition-colors duration-300 rounded-2xl shadow-sm">

                {/* Brand */}
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Fresh Sarura" className="h-10 w-auto" />
                    <div>
                        <h1 className="text-base font-bold text-green-700 dark:text-green-400 tracking-tight">Fresh Sarura</h1>
                        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Export &amp; Farmer Hub</p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex-1 max-w-md mx-8 hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search users, master data, system logs..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 text-sm dark:text-gray-200 dark:placeholder-gray-400 transition-all"
                        />
                    </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    <button
                        onClick={() => setIsNotificationsOpen(true)}
                        className="relative p-2.5 rounded-xl bg-white/80 hover:bg-green-500 hover:text-white transition-all shadow-sm dark:bg-gray-700/50 dark:text-gray-200 dark:hover:bg-green-600"
                    >
                        <Bell size={18} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                    </button>

                    <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-1 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-white text-sm font-bold shadow-md hover:saturate-150 transition-all active:scale-95">
                            {initials}
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">{formatRole(user.role)}</p>
                        </div>
                        <ChevronDown size={14} className="text-gray-400 ml-1" />
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
