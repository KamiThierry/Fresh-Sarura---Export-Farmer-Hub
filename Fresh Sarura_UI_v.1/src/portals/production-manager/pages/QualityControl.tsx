import { useState } from 'react';
import {
    CheckCircle, AlertOctagon, ShieldCheck, Activity,
    ClipboardCheck, Search
} from 'lucide-react';
import ScheduleInspectionModal from '../components/ScheduleInspectionModal';
import Pagination from '../../shared/component/Pagination';

interface QualityControlProps {
    onPerformInspection: () => void;
}

const QualityControl = ({ onPerformInspection }: QualityControlProps) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [gradeFilter, setGradeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // Mock Data for Inspection Log
    const inspections = [
        { id: 'INS-001', date: 'Jan 23', batch: 'GF-208', product: 'Habanero', shift: 'Morning Team', grade: 'A', notes: 'Perfect quality', status: 'Passed' },
        { id: 'INS-002', date: 'Jan 23', batch: 'GF-204', product: 'Mangoes', shift: 'Sorting Line A', grade: 'Rejected', notes: 'Chemical Residue Detected', status: 'Rejected', alert: true },
        { id: 'INS-003', date: 'Jan 22', batch: 'GF-202', product: 'Chili', shift: 'Afternoon Team', grade: 'B', notes: 'Minor shape irregularity', status: 'Passed' },
        { id: 'INS-004', date: 'Jan 22', batch: 'GF-201', product: 'French Beans', shift: 'Sorting Line B', grade: 'A', notes: '-', status: 'Passed' },
    ];

    // Filtered inspections — drives both the table AND the stat cards
    const filteredInspections = inspections.filter(i => {
        const matchesSearch = searchQuery === '' ||
            i.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.shift.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGrade = gradeFilter === 'all' || i.grade === gradeFilter;
        return matchesSearch && matchesGrade;
    });

    // Derived stats from filtered inspections
    const passCount = filteredInspections.filter(i => i.status === 'Passed').length;
    const passRate = filteredInspections.length > 0 ? ((passCount / filteredInspections.length) * 100).toFixed(1) : '0.0';
    const criticalCount = filteredInspections.filter(i => i.status === 'Rejected').length;
    const certCompliance = filteredInspections.length > 0
        ? ((filteredInspections.filter(i => i.grade !== 'Rejected').length / filteredInspections.length) * 100).toFixed(0)
        : '0';
    // Most common defect from notes (simple frequency count)
    const defectWords = filteredInspections
        .filter(i => i.notes !== '-')
        .flatMap(i => i.notes.split(' ').slice(0, 1));
    const topDefect = defectWords.length > 0 ? defectWords[0] : 'None';

    const summaryStats = [
        { label: 'Pass Rate', value: `${passRate}%`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', alert: false },
        { label: 'Critical Defects', value: `${criticalCount} Active`, icon: AlertOctagon, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', alert: criticalCount > 0 },
        { label: 'Compliance', value: `${certCompliance}% Cert.`, icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', alert: false },
        { label: 'Top Defect', value: topDefect, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', alert: false },
    ];

    // Mock Data for Dashboard
    const defects = [
        { name: 'Bruising (Mechanical)', percentage: 40, color: 'bg-orange-500' },
        { name: 'Undersized', percentage: 25, color: 'bg-yellow-500' },
        { name: 'Pest Damage', percentage: 10, color: 'bg-red-500' },
        { name: 'Coloration', percentage: 8, color: 'bg-blue-500' },
    ];

    const farmerPerformance = [
        { name: 'Kinvest Farm', score: 99, status: 'Top Performer', trend: 'up' },
        { name: 'Rusizi Co-op', score: 95, status: 'Consistent', trend: 'flat' },
        { name: 'Marie Claire', score: 88, status: 'Improving', trend: 'up' },
        { name: 'Robert / Almond', score: 60, status: 'Needs Attention', trend: 'down', alert: true },
    ];



    const handleScheduleSubmit = (inspection: any) => {
        console.log('Scheduled Inspection:', inspection);
        setIsScheduleOpen(false);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quality Control</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor product quality and inspections</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onPerformInspection}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <ClipboardCheck size={18} />
                        Log Intake Results
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-6">
                {summaryStats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <div className={`text-2xl font-bold mt-1 ${stat.alert ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                    {stat.value}
                                </div>

                            </div>
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'dashboard', label: 'Quality Dashboard' },
                        { id: 'log', label: 'Inspection Log' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
              `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">

                {/* TAB 1: DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-2 gap-6">
                        {/* Defect Breakdown */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Defect Types Logged (This Month)</h3>
                            <div className="space-y-6">
                                {defects.map((defect) => (
                                    <div key={defect.name}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{defect.name}</span>
                                            <span className="text-gray-500 dark:text-gray-400">{defect.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                                            <div className={`${defect.color} h-2.5 rounded-full`} style={{ width: `${defect.percentage}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Farmer Performance */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Farmer Quality Scores</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                                            <th className="pb-3">Farmer Name</th>
                                            <th className="pb-3 text-right">Grade A %</th>
                                            <th className="pb-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {farmerPerformance.map((farmer) => (
                                            <tr key={farmer.name}>
                                                <td className="py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                    {farmer.name}
                                                </td>
                                                <td className="py-4 text-right text-sm font-bold text-gray-900 dark:text-white">
                                                    {farmer.score}%
                                                </td>
                                                <td className="py-4 text-right">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${farmer.alert
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                                        }`}>
                                                        {farmer.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: INSPECTION LOG */}
                {activeTab === 'log' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {/* Search + Grade filter bar */}
                        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search product, batch, inspector…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <select
                                value={gradeFilter}
                                onChange={e => setGradeFilter(e.target.value)}
                                className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">All Grades</option>
                                <option value="A">Grade A</option>
                                <option value="B">Grade B</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            {(searchQuery || gradeFilter !== 'all') && (
                                <button
                                    onClick={() => { setSearchQuery(''); setGradeFilter('all'); }}
                                    className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="px-6 py-4">Date / ID</th>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">SHIFT</th>
                                    <th className="px-6 py-4">Score/Grade</th>
                                    <th className="px-6 py-4">Defect Notes</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredInspections.length > 0 ? filteredInspections.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                                    <tr key={item.id} className={item.alert ? 'bg-red-50/50 dark:bg-red-900/10' : ''}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.date}</span>
                                                <span className="text-xs text-gray-500 font-mono">{item.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">{item.product}</span>
                                            <span className="text-xs text-gray-500 block">Batch {item.batch}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {item.shift}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${item.grade === 'A' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                                                item.grade === 'B' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                                }`}>
                                                Grade {item.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                            {item.notes}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">View Report</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400 italic">
                                            No inspections match your filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <Pagination currentPage={currentPage} totalItems={filteredInspections.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default QualityControl;
