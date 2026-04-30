import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home, Users, ShieldAlert, Settings, LogOut,
    Database, BarChart3, ExternalLink,
    Sprout, Truck, FlaskConical, UserCog
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const mainGroups = [
        {
            title: 'Overview',
            items: [
                { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
            ],
        },
        {
            title: 'Administration',
            items: [
                { path: '/admin/users',       icon: Users,      label: 'User Management' },
                { path: '/admin/master-data', icon: Database,   label: 'Master Data' },
                { path: '/admin/event-logs',  icon: ShieldAlert, label: 'Event Logs' },
                { path: '/admin/reports',     icon: BarChart3,  label: 'Analytics & Reports' },
            ],
        },
    ];

    const portalLinks = [
        { path: '/pm',           icon: UserCog,     label: 'Production Manager', color: 'text-green-600' },
        { path: '/farm-manager', icon: Sprout,      label: 'Farm Manager',       color: 'text-emerald-600' },
        { path: '/logistics',    icon: Truck,       label: 'Logistics Officer',  color: 'text-blue-600' },
        { path: '/qc',           icon: FlaskConical, label: 'QC Officer',        color: 'text-purple-600' },
    ];

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
            isActive
                ? 'bg-[#5cb85c] text-white shadow-lg shadow-green-900/10'
                : 'text-gray-500 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
        }`;

    return (
        <aside className="fixed left-[10px] top-[84px] bottom-[10px] w-[260px] bg-gradient-to-b from-green-50 to-white dark:from-[#1F2937] dark:to-gray-900 border border-green-100 dark:border-gray-700 rounded-2xl shadow-xl z-30 flex flex-col transition-colors duration-300 hidden md:flex">
            <nav className="flex-1 overflow-y-auto py-2 px-3 custom-scrollbar">

                {mainGroups.map((group, i) => (
                    <div key={i} className="mb-1">
                        <div className="flex items-center px-3 mb-1 mt-2">
                            <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{group.title}</h3>
                            <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-600 ml-2" />
                        </div>
                        <div className="space-y-0.5">
                            {group.items.map(item => (
                                <NavLink key={item.path} to={item.path} className={linkClass}>
                                    <item.icon size={18} strokeWidth={2} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Portal Access */}
                <div className="mb-1">
                    <div className="flex items-center px-3 mb-1 mt-2">
                        <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Portal Access</h3>
                        <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-600 ml-2" />
                    </div>
                    <div className="space-y-0.5">
                        {portalLinks.map(item => (
                            <a
                                key={item.path}
                                href={item.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 group"
                            >
                                <item.icon size={18} strokeWidth={2} className={item.color} />
                                <span className="font-medium text-sm flex-1">{item.label}</span>
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                            </a>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Bottom — Settings + Sign Out */}
            <div className="p-3 mt-auto mb-2">
                <div className="flex items-center px-3 mb-2">
                    <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">System</h3>
                    <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-600 ml-2" />
                </div>
                <div className="space-y-0.5">
                    <NavLink to="/admin/settings" className={linkClass}>
                        <Settings size={18} strokeWidth={2} />
                        <span className="font-medium text-sm">Settings</span>
                    </NavLink>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 rounded-xl transition-all mt-1"
                    >
                        <LogOut size={18} />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
