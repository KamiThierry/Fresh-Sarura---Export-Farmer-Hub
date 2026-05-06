import { useState, useEffect } from 'react';
import { Truck, Scale, Plane, FileWarning, Loader2 } from 'lucide-react';
import ActionCenter from '../components/ActionCenter';
import ShipmentBuilderModal from '../components/ShipmentBuilderModal';
import { api } from '../../../lib/api';

const Dashboard = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { name: 'Logistics Officer' };
    const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);

    const [stats, setStats] = useState({
        activeFleet: 0,
        pendingPickups: 0,
        activeShipments: 0,
        pendingDocs: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [vehiclesRes, pickupsRes, shipmentsRes, docsRes] = await Promise.all([
                api.get('/fleet/vehicles'),
                api.get('/harvest-declarations?status=Pending'),
                api.get('/shipments'),
                api.get('/export-documents'),
            ]);

            const vehicles = vehiclesRes.data || [];
            const pickups = pickupsRes.data || [];
            const shipments = shipmentsRes.data || [];
            const docs = docsRes.data || [];

            const activeShipments = shipments.filter((s: any) =>
                s.status === 'PackingListGenerated' || s.status === 'Departed'
            ).length;

            // Pending docs: documents that have not been verified yet
            const pendingDocs = docs.filter((d: any) => d.status !== 'Verified').length;

            setStats({
                activeFleet: vehicles.filter((v: any) => v.status === 'Available' || v.status === 'On Trip').length,
                pendingPickups: pickups.length,
                activeShipments,
                pendingDocs,
            });
        } catch (err) {
            console.error('Dashboard stats error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const statCards = [
        {
            label: 'Pending Pickups',
            value: loading ? '—' : stats.pendingPickups,
            sub: 'Awaiting field collection',
            icon: Scale,
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            color: 'text-blue-600',
            subColor: 'text-blue-500',
        },
        {
            label: 'Active Fleet',
            value: loading ? '—' : `${stats.activeFleet} Vehicles`,
            sub: 'Available or on trip',
            icon: Truck,
            bg: 'bg-green-50 dark:bg-green-900/20',
            color: 'text-green-600',
            subColor: 'text-green-500',
        },
        {
            label: 'Active Shipments',
            value: loading ? '—' : stats.activeShipments,
            sub: 'Scheduled or in transit',
            icon: Plane,
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            color: 'text-purple-600',
            subColor: 'text-orange-500',
        },
        {
            label: 'Unverified Docs',
            value: loading ? '—' : stats.pendingDocs,
            sub: stats.pendingDocs > 0 ? 'Action required' : 'All clear',
            icon: FileWarning,
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            color: 'text-amber-600',
            subColor: stats.pendingDocs > 0 ? 'text-amber-600' : 'text-green-500',
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-[#5cb85c] p-8 text-white shadow-lg">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Truck className="h-8 w-8 text-green-100" />
                            <h1 className="text-2xl md:text-3xl font-bold">
                                Welcome back, {user.name.split(' ')[0]}
                            </h1>
                        </div>
                        <p className="text-green-100 text-base md:text-lg opacity-90 max-w-2xl">
                            Monitor active shipments, export cycles, and fleet status in real-time.
                        </p>
                    </div>
                    {loading && (
                        <Loader2 className="animate-spin text-green-200" size={24} />
                    )}
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-20 -mb-10 h-40 w-40 rounded-full bg-green-400 opacity-20 blur-2xl pointer-events-none" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                                <p className={`text-xs font-medium mt-1 ${stat.subColor}`}>{stat.sub}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 h-96 flex flex-col items-center justify-center gap-3 text-gray-400">
                        <Truck size={40} className="opacity-20" />
                        <p className="text-sm font-medium">Fleet map coming in a future update</p>
                    </div>
                </div>
                <div>
                    <ActionCenter />
                </div>
            </div>

            <ShipmentBuilderModal
                isOpen={isShipmentModalOpen}
                onClose={() => setIsShipmentModalOpen(false)}
                onSuccess={fetchStats}
            />
        </div>
    );
};

export default Dashboard;
