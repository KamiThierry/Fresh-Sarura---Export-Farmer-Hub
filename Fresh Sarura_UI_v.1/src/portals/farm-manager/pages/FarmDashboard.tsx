import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Scale, Users, CloudSun, AlertTriangle,
    Activity, TrendingUp, Truck, Package,
    Sprout, Leaf, Calendar, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import HarvestReadyModal from '../components/HarvestReadyModal';
import RequestSuppliesModal from '../components/RequestSuppliesModal';
import { useFarmManager } from '../../../lib/useFarmManager';

const FarmDashboard = () => {
    const navigate = useNavigate();
    const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
    const [isSuppliesModalOpen, setIsSuppliesModalOpen] = useState(false);

    const { dashboard, cycles, loading, submitFieldReport } = useFarmManager();

    // Get farmer name from localStorage user object (set at login)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const farmerName = dashboard?.farmer?.full_name || user?.name || 'Farm Manager';

    const activeCycles = cycles.filter((c: any) => c.status === 'Active');

    const stats = [
        {
            icon: Scale,
            label: 'Active Cycles',
            value: loading ? '—' : String(activeCycles.length),
            sub: `${cycles.length} total cycles`,
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            icon: Users,
            label: 'Farm Size',
            value: loading ? '—' : `${dashboard?.farmer?.farm_size_hectares ?? '—'} Ha`,
            sub: dashboard?.farmer?.district || 'Location',
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            icon: CloudSun,
            label: 'Pending Requests',
            value: loading ? '—' : String(dashboard?.summary?.pendingRequests ?? 0),
            sub: 'Awaiting PM approval',
            color: 'text-orange-600',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
        },
        {
            icon: AlertTriangle,
            label: 'Forecasts Pending',
            value: loading ? '—' : String(dashboard?.summary?.pendingForecasts ?? 0),
            sub: 'Awaiting verification',
            color: 'text-red-600',
            bg: 'bg-red-50 dark:bg-red-900/20',
        },
    ];

    const quickActions = [
        {
            icon: Truck,
            title: 'Declare Harvest Ready',
            sub: 'Request truck pickup for completed yield.',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-600/20',
            hoverColor: 'hover:border-green-600',
            onClick: () => setIsHarvestModalOpen(true),
        },
        {
            icon: Activity,
            title: 'Log Activity',
            sub: 'Mark crop cycle tasks as complete.',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-600/20',
            hoverColor: 'hover:border-blue-600',
            onClick: () => navigate('/farm-manager/crop-planning'),
        },
        {
            icon: TrendingUp,
            title: 'Yield Forecast',
            sub: 'Update expected harvest volumes.',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            borderColor: 'border-purple-600/20',
            hoverColor: 'hover:border-purple-600',
            onClick: () => navigate('/farm-manager/yield-forecast'),
        },
        {
            icon: Package,
            title: 'Request Supplies',
            sub: 'Request seeds, fertilizers, or tools.',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            borderColor: 'border-amber-600/20',
            hoverColor: 'hover:border-amber-600',
            onClick: () => setIsSuppliesModalOpen(true),
        },
    ];

    // Build harvest chart from real cycle budget data
    const harvestHistory = cycles.slice(0, 4).map((c: any, i: number) => ({
        week: c.crop_name?.substring(0, 4) || `C${i + 1}`,
        kgs: c.spent || 0,
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 size={32} className="animate-spin text-green-500" />
            </div>
        );
    }

    return (
        <>
            <div className="p-4 md:p-6 space-y-6 pb-24">

                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 to-green-600 p-8 text-white shadow-lg">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <Sprout className="h-8 w-8 text-green-100" />
                            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {farmerName}</h1>
                        </div>
                        <p className="text-green-100 text-base md:text-lg opacity-90 max-w-2xl">
                            {dashboard?.farmer?.district
                                ? `Managing ${dashboard.farmer.farm_size_hectares} Ha in ${dashboard.farmer.district} — Track your field operations and harvest targets.`
                                : 'Track your field operations, weather, and harvest targets.'}
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl" />
                    <div className="absolute bottom-0 right-20 -mb-10 h-40 w-40 rounded-full bg-green-400 opacity-20 blur-2xl" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1">{stat.label}</p>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                                </div>
                                <div className={`p-2.5 md:p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={stat.color} size={20} />
                                </div>
                            </div>
                            <p className={`text-xs md:text-sm font-medium ${stat.color}`}>{stat.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            onClick={action.onClick}
                            className={`flex items-center gap-3 md:gap-4 p-4 rounded-xl border ${action.borderColor} bg-white dark:bg-gray-800 dark:border-white/10 shadow-sm transition-all duration-200 ${action.hoverColor} hover:shadow-md text-left group`}
                        >
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${action.bgColor} flex items-center justify-center transition-transform group-hover:scale-105 shrink-0`}>
                                <action.icon className={action.color} size={20} strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">{action.title}</h3>
                                <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{action.sub}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Chart + Active Cycles */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">Budget Spent Per Cycle</h4>
                                <p className="text-xs text-gray-500">Actual spend vs budget per active cycle</p>
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <Calendar size={18} className="text-gray-500 dark:text-gray-300" />
                            </div>
                        </div>
                        <div className="h-64 w-full">
                            {harvestHistory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={harvestHistory}>
                                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="kgs" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                    No cycle data yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Cycles Widget */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                            <h4 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <Leaf size={18} className="text-green-600" />
                                Active Crop Cycles
                            </h4>
                        </div>
                        <div className="flex-1 overflow-auto p-2">
                            {activeCycles.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">No active cycles</div>
                            ) : (
                                activeCycles.map((cycle: any) => (
                                    <div key={cycle._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors mb-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 font-bold text-xs">
                                                {cycle.crop_name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{cycle.crop_name}</p>
                                                <p className="text-xs text-gray-500">{cycle.season}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${cycle.status === 'Harvesting'
                                            ? 'bg-amber-100 text-amber-700 animate-pulse'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {cycle.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => navigate('/farm-manager/crop-planning')}
                                className="w-full py-2 text-xs font-bold text-center text-green-600 hover:text-green-700 transition-colors"
                            >
                                View All Field Plans →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <HarvestReadyModal
                isOpen={isHarvestModalOpen}
                onClose={() => setIsHarvestModalOpen(false)}
                onSubmitConfirm={async (cropText) => {
                    // Find the cycle being declared
                    const cycle = activeCycles.find((c: any) =>
                        c.crop_name?.toLowerCase().includes(cropText.toLowerCase().split(' ')[0])
                    );
                    if (cycle) {
                        // Log as a field report so PM can see it
                        await submitFieldReport({
                            cycleId: cycle._id,
                            description: `Harvest Ready Declaration: ${cropText}`,
                            actualCostRwf: 0,
                            notes: `Farm Manager declared harvest ready for ${cropText}`,
                        });
                    }
                }}
            />
            <RequestSuppliesModal
                isOpen={isSuppliesModalOpen}
                onClose={() => setIsSuppliesModalOpen(false)}
            />
        </>
    );
};

export default FarmDashboard;