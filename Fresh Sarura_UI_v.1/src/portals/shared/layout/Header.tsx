import { Leaf, Search, Bell } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle'; // Adjusted import path

const Header = () => {
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
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search batches, farmers, exports..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F6F0] border-theme focus:outline-none focus:ring-2 focus:ring-[#66BB6A] text-sm dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3">
                <ThemeToggle />

                {/* Notification Icon */}
                <button className="relative p-2.5 rounded-xl bg-white/80 hover:bg-[#4CAF50] hover:text-white transition-all shadow-sm dark:bg-gray-700/50 dark:text-gray-200 dark:hover:bg-green-600">
                    <Bell size={18} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#4CAF50] rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                </button>

                {/* User Avatar & Profile */}
                <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-[#222222] dark:text-white">Operations Manager</p>
                        <p className="text-xs text-[#6B7280] dark:text-gray-400">Unified Ops</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-white text-sm font-semibold shadow-md">
                        OM
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
