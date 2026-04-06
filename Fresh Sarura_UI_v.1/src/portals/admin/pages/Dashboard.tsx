import { Users, Clock, Database, AlertCircle, ClipboardList, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ label, value, sub, icon: Icon, color, onClick }: {
    label: string; value: string; sub: string;
    icon: React.ElementType; color: string; onClick?: () => void;
}) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4 ${onClick ? 'hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer' : ''}`}
    >
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon size={22} />
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();

    const stats = [
        { label: 'Total Users', value: '47', sub: '+3 this week', icon: Users, color: 'bg-green-50 text-green-600 dark:bg-green-900/20' },
        { label: 'Pending Approvals', value: '5', sub: 'Accounts awaiting review', icon: Clock, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20', onClick: () => navigate('/admin/users', { state: { filter: 'pending' } }) },
        { label: 'Master Entities', value: '24', sub: 'Active records', icon: Database, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' },
        { label: 'System Alerts', value: '3', sub: '1 critical', icon: AlertCircle, color: 'bg-red-50 text-red-600 dark:bg-red-900/20', onClick: () => navigate('/admin/event-logs', { state: { filter: 'critical' } }) },
    ];

    const recentActivity = [
        { text: 'Farm Manager (Simbi Farm) account approved', sub: 'Actor: admin@freshsarura.rw', time: '2 min ago', dot: 'bg-green-500' },
        { text: "New crop 'Habanero' added to Master Data", sub: 'Actor: admin@freshsarura.rw', time: '18 min ago', dot: 'bg-blue-500' },
        { text: 'Failed login attempt detected', sub: 'Source: IP 197.243.22.10', time: '1 hr ago', dot: 'bg-red-500' },
        { text: 'System backup completed successfully', sub: 'Source: System Automator', time: '3 hrs ago', dot: 'bg-green-500' },
    ];

    return (
        <div className="p-6 space-y-6 animate-fade-in">

            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 to-green-600 p-8 text-white shadow-lg flex flex-col justify-between gap-4">
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold">Welcome back, Thierry</h1>
                            </div>
                            <p className="text-green-100 text-base md:text-lg opacity-90 max-w-2xl">
                                Manage users, master data, and monitor system health from one place.
                            </p>
                        </div>
                        {/* System Status Badge */}
                        <div className="flex-shrink-0">
                            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                                System Status: Operational
                            </span>
                        </div>
                    </div>
                </div>

                {/* Decorators */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-20 -mb-10 h-40 w-40 rounded-full bg-green-400 opacity-20 blur-2xl pointer-events-none"></div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map(s => <StatCard key={s.label} {...s} />)}
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ClipboardList size={18} className="text-green-500" />
                            Recent Activity
                        </h2>
                        <button
                            onClick={() => navigate('/admin/event-logs')}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                        >
                            View All <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {recentActivity.map((a, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${a.dot}`} />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{a.text}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{a.sub}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Users size={18} className="text-green-500" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Add User', icon: Users, href: '/admin/users' },
                            { label: 'Review Pending', icon: Clock, href: '/admin/users' },
                            { label: 'Add Master Data', icon: Database, href: '/admin/master-data' },
                            { label: 'View Event Logs', icon: ShieldAlert, href: '/admin/event-logs' },
                        ].map(q => (
                            <a
                                key={q.label}
                                href={q.href}
                                className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all cursor-pointer"
                            >
                                <q.icon size={16} className="text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{q.label}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
