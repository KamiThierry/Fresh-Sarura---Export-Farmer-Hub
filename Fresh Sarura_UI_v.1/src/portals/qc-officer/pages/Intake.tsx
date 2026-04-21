import { useState, useEffect } from 'react';
import { Truck, ClipboardList, AlertCircle, CheckCircle, Clock, ChevronDown, ChevronUp, Layers, RefreshCw } from 'lucide-react';
import RequestRoomModal from '../components/RequestRoomModal';
import { api } from '../../../lib/api';

// --- Types ---
type IntakeStatus = 'Awaiting QC' | 'In Progress' | 'Completed' | 'Rejected';

interface IntakeRecord {
    id: string; // Harvest Declaration ID
    intakeLogId?: string;
    crop: string;
    supplier: string;
    arrivalTime: string;
    weight: string;
    weightNum: number;
    status: IntakeStatus;
    driver: string;
}

const statusStyles: Record<IntakeStatus, string> = {
    'Awaiting QC': 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
    'In Progress': 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
    'Completed': 'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
    'Rejected': 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
};

const Intake = () => {
    const [intakes, setIntakes] = useState<IntakeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<IntakeStatus | 'All'>('All');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [selectedIntake, setSelectedIntake] = useState<IntakeRecord | null>(null);

    const fetchIntakes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/harvest-declarations?status=PickedUp');
            const data = (res.data.data || []).map((d: any) => ({
                id: d._id,
                intakeLogId: d.intakeLogId,
                crop: d.cropName,
                supplier: d.farmerId?.full_name || d.farmName || 'Unknown',
                arrivalTime: new Date(d.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                weight: `${d.pickedUpWeightKg || d.estimatedWeightKg} kg`,
                weightNum: d.pickedUpWeightKg || d.estimatedWeightKg,
                status: 'Awaiting QC',
                driver: d.truckId || 'N/A'
            }));
            setIntakes(data);
        } catch (err) {
            console.error('Failed to fetch intakes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIntakes();
    }, []);

    const statsSummary = [
        { label: 'Pending Intake', value: intakes.length.toString(), icon: Truck, color: 'text-gray-600', bg: 'bg-gray-50  dark:bg-gray-700/50' },
        { label: 'Awaiting QC', value: intakes.filter(i => i.status === 'Awaiting QC').length.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Total Weight', value: `${intakes.reduce((acc, i) => acc + i.weightNum, 0).toLocaleString()} kg`, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ];
    const filtered = intakes.filter(r => {
        const matchSearch = r.id.toLowerCase().includes(search.toLowerCase()) ||
            r.crop.toLowerCase().includes(search.toLowerCase()) ||
            r.supplier.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'All' || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <>
            <div className="p-6 space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Intake (Receiving)</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track produce arriving from field collections.</p>
                    </div>
                    <button
                        onClick={fetchIntakes}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 transition-colors shadow-sm"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh List
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {statsSummary.map((s, i) => (
                        <div key={i} className={`${s.bg} rounded-xl p-3 flex flex-col gap-1`}>
                            <s.icon size={16} className={s.color} />
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
                            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-theme shadow-sm p-4 flex flex-wrap items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search by ID, crop, or supplier..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-theme text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-theme shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50">
                                    {['Ref ID', 'Crop', 'Supplier', 'Arrival', 'Weight', 'Driver', 'Status', 'Action'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">Loading arrivals...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">No arrivals awaiting QC.</td>
                                    </tr>
                                ) : filtered.map(row => (
                                    <React.Fragment key={row.id}>
                                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white font-mono">{row.id.slice(-6).toUpperCase()}</td>
                                            <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{row.crop}</td>
                                            <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{row.supplier}</td>
                                            <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{row.arrivalTime}</td>
                                            <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">{row.weight}</td>
                                            <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{row.driver}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[row.status]}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedIntake(row)}
                                                    className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                                >
                                                    <Layers size={14} /> Start QC
                                                </button>
                                                <button
                                                    onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    {expandedRow === row.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRow === row.id && (
                                            <tr className="bg-gray-50 dark:bg-gray-700/20">
                                                <td colSpan={8} className="px-8 py-4">
                                                    <div className="grid grid-cols-3 gap-6 text-sm">
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Declaration ID</p><p className="font-mono text-gray-900 dark:text-white">{row.id}</p></div>
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Intake Log Ref</p><p className="font-mono text-gray-900 dark:text-white">{row.intakeLogId || 'N/A'}</p></div>
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Source</p><p className="font-bold text-gray-900 dark:text-white">{row.supplier}</p></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Request Processing Room Modal */}
            <RequestRoomModal
                isOpen={!!selectedIntake}
                onClose={() => setSelectedIntake(null)}
                data={selectedIntake ? {
                    intakeLogId: selectedIntake.intakeLogId || '',
                    cropName: selectedIntake.crop,
                    pickedUpWeightKg: selectedIntake.weightNum
                } : null}
                onSuccess={fetchIntakes}
            />
        </>
    );
};

export default Intake;
