import { useState } from 'react';
import { Truck, ClipboardList, AlertCircle, CheckCircle, Clock, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import LogRawIntakeModal from '../components/LogRawIntakeModal';

// --- Mock Intake Data ---
type IntakeStatus = 'Awaiting QC' | 'In Progress' | 'Completed' | 'Rejected';

interface IntakeRecord {
    id: string;
    crop: string;
    supplier: string;
    arrivalTime: string;
    weight: string;
    status: IntakeStatus;
    driver: string;
}

const mockIntakes: IntakeRecord[] = [
    { id: 'INT-001', crop: 'French Beans', supplier: 'Kirehe Co-op', arrivalTime: '08:30 AM', weight: '620 kg', status: 'Awaiting QC', driver: 'Jean C.' },
    { id: 'INT-002', crop: 'Avocados (Hass)', supplier: 'Simbi Farm A', arrivalTime: '09:15 AM', weight: '880 kg', status: 'Awaiting QC', driver: 'Eric M.' },
    { id: 'INT-003', crop: 'Snow Peas', supplier: 'Kamonyi Growers', arrivalTime: '10:00 AM', weight: '450 kg', status: 'In Progress', driver: 'Alice N.' },
    { id: 'INT-004', crop: 'Baby Courgettes', supplier: 'Rwamagana Coop', arrivalTime: '07:00 AM', weight: '310 kg', status: 'Completed', driver: 'Patrick R.' },
    { id: 'INT-005', crop: 'Chillies (Red)', supplier: 'Huye District Farmers', arrivalTime: '06:45 AM', weight: '190 kg', status: 'Rejected', driver: 'Samuel K.' },
];

const statusStyles: Record<IntakeStatus, string> = {
    'Awaiting QC': 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
    'In Progress': 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
    'Completed': 'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
    'Rejected': 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
};

const statsSummary = [
    { label: 'Total Today', value: '5', icon: Truck, color: 'text-gray-600', bg: 'bg-gray-50  dark:bg-gray-700/50' },
    { label: 'Awaiting QC', value: '2', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'In Progress', value: '1', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50  dark:bg-blue-900/20' },
    { label: 'Completed', value: '1', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Rejected', value: '1', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50   dark:bg-red-900/20' },
    { label: 'Total Weight', value: '2,450 kg', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
];

const Intake = () => {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<IntakeStatus | 'All'>('All');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

    const filtered = mockIntakes.filter(r => {
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
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Log and track all incoming produce arrivals for today.</p>
                    </div>
                    <button
                        onClick={() => setIsIntakeModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Plus size={16} /> Log Raw Intake
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
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
                    <div className="flex gap-2 flex-wrap">
                        {(['All', 'Awaiting QC', 'In Progress', 'Completed', 'Rejected'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === s
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-theme shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50">
                                    {['Intake ID', 'Crop', 'Supplier', 'Arrival Time', 'Weight', 'Driver', 'Status', 'Action'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">No matching intake records found.</td>
                                    </tr>
                                ) : filtered.map(row => (
                                    <>
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">{row.id}</td>
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
                                                {row.status === 'Awaiting QC' && (
                                                    <button className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                                        Start QC
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    {expandedRow === row.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRow === row.id && (
                                            <tr key={`${row.id}-expand`} className="bg-gray-50 dark:bg-gray-700/20">
                                                <td colSpan={8} className="px-8 py-4">
                                                    <div className="grid grid-cols-3 gap-6 text-sm">
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Intake ID</p><p className="font-bold text-gray-900 dark:text-white">{row.id}</p></div>
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Full Crop Name</p><p className="font-bold text-gray-900 dark:text-white">{row.crop}</p></div>
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Gross Weight</p><p className="font-bold text-gray-900 dark:text-white">{row.weight}</p></div>
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Supplier</p><p className="font-bold text-gray-900 dark:text-white">{row.supplier}</p></div>
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Driver</p><p className="font-bold text-gray-900 dark:text-white">{row.driver}</p></div>
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Current Status</p>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[row.status]}`}>{row.status}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Log Raw Intake Modal */}
            <LogRawIntakeModal
                isOpen={isIntakeModalOpen}
                onClose={() => setIsIntakeModalOpen(false)}
            />
        </>
    );
};

export default Intake;
