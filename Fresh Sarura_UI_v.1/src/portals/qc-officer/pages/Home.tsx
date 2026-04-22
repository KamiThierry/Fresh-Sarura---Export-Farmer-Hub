import { useState, useEffect } from 'react';
import { Truck, ClipboardList, CheckCircle, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import RecordQCModal, { QCInspectionData } from '../components/RecordQCModal';
import { api } from '../../../lib/api';

// --- Types ---
type InspectionStatus = 'RoomRequested' | 'Processing' | 'Done';

interface PriorityInspection {
    id: string;
    batchId: string;
    crop: string;
    arrivalTime: string;
    status: InspectionStatus;
    supplier: string;
    grossWeight: number;
}

const statusStyles: Record<string, string> = {
    'RoomRequested': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Processing': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Done': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const Home = () => {
    const [stats, setStats] = useState({
        pendingIntake: 0,
        pendingQC: 0,
        passedToday: 0,
        rejectionRate: 0,
    });
    const [inspections, setInspections] = useState<PriorityInspection[]>([]);
    const [loading, setLoading] = useState(true);
    const [qcModalData, setQcModalData] = useState<QCInspectionData | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Pending Intake (Declarations not picked up)
            const resIntake = await api.get('/harvest-declarations?status=Pending');
            const pendingIntakeCount = resIntake.results || 0;

            // 2. Pending QC (My Batches)
            const resBatches = await api.get('/processing-batches/my');
            const pendingQCBatches = (resBatches.data || []).filter((b: any) => b.status !== 'Done');

            // 3. Today's Stats from Stock
            const resStock = await api.get('/stock');
            const doneToday = (resStock.data || []).filter((b: any) => 
                new Date(b.updatedAt).toDateString() === new Date().toDateString()
            );

            const passedToday = doneToday.reduce((sum: number, b: any) => sum + (b.processedWeightKg || 0), 0);
            const totalReceivedToday = doneToday.reduce((sum: number, b: any) => sum + (b.receivedWeightKg || 0), 0);
            const totalRejectedToday = doneToday.reduce((sum: number, b: any) => sum + (b.rejectedWeightKg || 0), 0);
            const rejectionRate = totalReceivedToday > 0 ? (totalRejectedToday / totalReceivedToday) * 100 : 0;

            setStats({
                pendingIntake: pendingIntakeCount,
                pendingQC: pendingQCBatches.length,
                passedToday,
                rejectionRate,
            });

            setInspections(pendingQCBatches.map((b: any) => ({
                id: b._id,
                batchId: b._id,
                crop: b.cropName,
                arrivalTime: new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: b.status,
                supplier: b.intakeLogId?.farmerId?.full_name || 'Generic Source',
                grossWeight: b.receivedWeightKg,
            })));

        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const kpiCards = [
        {
            label: 'Pending Intake',
            value: `${stats.pendingIntake} Declarations`,
            sub: 'Waiting for pickup',
            icon: Truck,
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            label: 'Pending QC',
            value: `${stats.pendingQC} Batches`,
            sub: 'Awaiting room or processing',
            icon: ClipboardList,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            label: 'Passed Today',
            value: `${Math.round(stats.passedToday).toLocaleString()} kg`,
            sub: 'Cleared for storage',
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            label: 'Rejection Rate',
            value: `${stats.rejectionRate.toFixed(1)}%`,
            sub: 'Based on today\'s inspections',
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50 dark:bg-red-900/20',
        },
    ];


    return (
        <>
            <div className="p-6 space-y-6">

                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 to-green-600 p-8 text-white shadow-lg">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-1">Welcome back, QC Inspector.</h1>
                        <p className="text-green-100 text-base opacity-90">
                            Monitor today's intake, pending inspections, and packhouse floor status.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 right-20 -mb-10 h-40 w-40 rounded-full bg-green-400 opacity-20 blur-2xl"></div>
                </div>

                {/* KPI Ribbon */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {kpiCards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                                    <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                                        {card.value}
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1">{card.sub}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${card.bg}`}>
                                    <card.icon className={card.color} size={24} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Action & Activity Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Priority Inspections */}
                    <div className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-theme overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white">Priority Queue</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Batches awaiting room or inspection</p>
                            </div>
                            <button onClick={fetchData} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors">
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Batch ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Crop</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {loading ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading queue...</td></tr>
                                    ) : inspections.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No priority items today.</td></tr>
                                    ) : inspections.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white font-mono">{row.id.slice(-6).toUpperCase()}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{row.crop}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[row.status]}`}>
                                                    {row.status === 'RoomRequested' ? 'Waiting for Room' : row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    disabled={row.status === 'RoomRequested'}
                                                    onClick={() => setQcModalData({ intakeId: row.batchId, crop: row.crop, supplier: row.supplier, grossWeight: row.grossWeight })}
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                                                        row.status === 'RoomRequested' 
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}>
                                                    {row.status === 'RoomRequested' ? 'Pending PM' : 'Start Inspection'} <ArrowRight size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-theme overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Summary</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Quick insights</p>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                             <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Efficiency</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">95.8%</span>
                                    <span className="text-xs text-green-600 mb-1 font-bold">+2.1% ↑</span>
                                </div>
                             </div>
                             <button 
                                onClick={fetchData}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-green-600 text-green-700 dark:text-green-400 dark:border-green-500 font-semibold text-sm hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                             >
                                Refresh Dashboard
                             </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Record QC Modal */}
            <RecordQCModal
                isOpen={!!qcModalData}
                onClose={() => setQcModalData(null)}
                data={qcModalData}
                onSubmit={async (res) => {
                    try {
                        await api.patch(`/processing-batches/${res.intakeId}/complete`, {
                            processedWeightKg: res.netWeight,
                            rejectedWeightKg: res.rejectedWeight
                        });
                        fetchData();
                    } catch (err) {
                        console.error('Failed to complete QC:', err);
                    }
                }}
            />
        </>
    );
};

export default Home;
