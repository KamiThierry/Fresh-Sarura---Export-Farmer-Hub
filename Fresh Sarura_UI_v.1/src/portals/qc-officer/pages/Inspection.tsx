import { useState } from 'react';
import { ClipboardList, CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import RecordQCModal, { QCInspectionData } from '../components/RecordQCModal';

type QCStatus = 'Pending' | 'Pass' | 'Fail' | 'Under Review';

interface InspectionRecord {
    id: string;
    intakeId: string;
    crop: string;
    inspector: string;
    startTime: string;
    grade: string;
    defectRate: string;
    status: QCStatus;
    supplier: string;
    grossWeight: number;
}

const mockInspections: InspectionRecord[] = [
    { id: 'QC-001', intakeId: 'INT-001', crop: 'French Beans', inspector: 'QC Officer', startTime: '08:45 AM', grade: 'A', defectRate: '2.1%', status: 'Under Review', supplier: 'Kinvest Farm', grossWeight: 1200 },
    { id: 'QC-002', intakeId: 'INT-003', crop: 'Snow Peas', inspector: 'QC Officer', startTime: '10:15 AM', grade: 'B', defectRate: '5.8%', status: 'Pending', supplier: 'Simbi Farm A', grossWeight: 880 },
    { id: 'QC-003', intakeId: 'INT-004', crop: 'Baby Courgettes', inspector: 'QC Officer', startTime: '07:30 AM', grade: 'A+', defectRate: '0.9%', status: 'Pass', supplier: 'Rusizi Co-op', grossWeight: 450 },
    { id: 'QC-004', intakeId: 'INT-005', crop: 'Chillies (Red)', inspector: 'QC Officer', startTime: '07:15 AM', grade: 'F', defectRate: '28%', status: 'Fail', supplier: 'Jean Claude', grossWeight: 190 },
];

const statusStyles: Record<QCStatus, string> = {
    'Pending': 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
    'Pass': 'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
    'Fail': 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
    'Under Review': 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
};

const statusIcons: Record<QCStatus, React.ElementType> = {
    'Pending': Clock,
    'Pass': CheckCircle,
    'Fail': XCircle,
    'Under Review': ClipboardList,
};

const kpi = [
    { label: 'Total Batches', value: '4', color: 'text-gray-600', bg: 'bg-gray-50  dark:bg-gray-700/50', icon: ClipboardList },
    { label: 'Pending', value: '1', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: Clock },
    { label: 'Under Review', value: '1', color: 'text-blue-600', bg: 'bg-blue-50  dark:bg-blue-900/20', icon: ClipboardList },
    { label: 'Passed', value: '1', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle },
    { label: 'Failed', value: '1', color: 'text-red-600', bg: 'bg-red-50   dark:bg-red-900/20', icon: XCircle },
    { label: 'Avg Defect Rate', value: '9.2%', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: AlertTriangle },
];

const Inspection = () => {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<QCStatus | 'All'>('All');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [qcModalData, setQcModalData] = useState<QCInspectionData | null>(null);

    const filtered = mockInspections.filter(r => {
        const matchSearch = r.id.toLowerCase().includes(search.toLowerCase()) ||
            r.crop.toLowerCase().includes(search.toLowerCase()) ||
            r.intakeId.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'All' || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inspection & Sorting</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Review QC inspection results and grade each intake batch.</p>
                </div>
            </div>

            {/* KPI Mini Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {kpi.map((k, i) => (
                    <div key={i} className={`${k.bg} rounded-xl p-3 flex flex-col gap-1`}>
                        <k.icon size={16} className={k.color} />
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{k.label}</p>
                        <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-theme shadow-sm p-4 flex flex-wrap items-center gap-3">
                <input
                    type="text"
                    placeholder="Search by QC ID, Intake ID, or crop..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-theme text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex gap-2 flex-wrap">
                    {(['All', 'Pending', 'Under Review', 'Pass', 'Fail'] as const).map(s => (
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
                                {['QC ID', 'Intake ID', 'Crop', 'Start Time', 'Grade', 'Defect Rate', 'Status', ''].map((h, i) => (
                                    <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">No matching inspection records found.</td></tr>
                            ) : filtered.map(row => {
                                const Icon = statusIcons[row.status];
                                return (
                                    <>
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">{row.id}</td>
                                            <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{row.intakeId}</td>
                                            <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{row.crop}</td>
                                            <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{row.startTime}</td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{row.grade}</span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{row.defectRate}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[row.status]}`}>
                                                    <Icon size={11} /> {row.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 flex items-center justify-end gap-2">
                                                {row.status === 'Pending' && (
                                                    <button
                                                        onClick={() => setQcModalData({ intakeId: row.intakeId, crop: row.crop, supplier: row.supplier, grossWeight: row.grossWeight })}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm">
                                                        Start QC <ArrowRight size={12} />
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
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">QC ID</p><p className="font-bold text-gray-900 dark:text-white">{row.id}</p></div>
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Crop</p><p className="font-bold text-gray-900 dark:text-white">{row.crop}</p></div>
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Grade</p><p className="font-bold text-gray-900 dark:text-white">{row.grade}</p></div>
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Defect Rate</p><p className="font-bold text-gray-900 dark:text-white">{row.defectRate}</p></div>
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Inspector</p><p className="font-bold text-gray-900 dark:text-white">{row.inspector}</p></div>
                                                        <div><p className="text-xs text-gray-400 font-semibold uppercase mb-1">Status</p>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[row.status]}`}>{row.status}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Record QC Modal */}
            <RecordQCModal
                isOpen={!!qcModalData}
                onClose={() => setQcModalData(null)}
                data={qcModalData}
                onSubmit={(res) => console.log("QC Submitted:", res)}
            />
        </div>
    );
};

export default Inspection;
