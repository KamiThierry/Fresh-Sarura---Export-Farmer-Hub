import { useState } from 'react';
import { ShieldAlert, Search, Filter, Download, Activity, Lock, UserCheck, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import Pagination from '../../shared/component/Pagination';

const MOCK_EVENTS = [
    { id: 'EVT-1048', timestamp: 'Mar 03, 10:15 AM', severity: 'CRITICAL', description: 'Multiple failed login attempts', actor: 'Unknown', ip: '197.243.22.10' },
    { id: 'EVT-1047', timestamp: 'Mar 03, 09:45 AM', severity: 'INFO', description: "Master Data 'Crop' updated", actor: 'Super Admin', ip: '10.0.0.45' },
    { id: 'EVT-1046', timestamp: 'Mar 03, 08:30 AM', severity: 'WARNING', description: 'Export batch #B-2026-001 canceled', actor: 'Production Manager', ip: '10.0.1.12' },
    { id: 'EVT-1045', timestamp: 'Mar 03, 07:00 AM', severity: 'INFO', description: 'System automated backup completed', actor: 'SYSTEM', ip: 'localhost' },
    { id: 'EVT-1044', timestamp: 'Mar 02, 16:20 PM', severity: 'INFO', description: 'New account approved (Simbi Farm)', actor: 'Super Admin', ip: '10.0.0.45' },
];

const EventLogs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState('All');
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const filteredEvents = MOCK_EVENTS.filter(event => {
        const matchesSearch =
            event.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.ip.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSeverity = severityFilter === 'All' || event.severity.toLowerCase() === severityFilter.toLowerCase();

        return matchesSearch && matchesSeverity;
    });

    const kpiCards = [
        { label: 'Total Events', value: filteredEvents.length.toString(), icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Critical Alerts', value: filteredEvents.filter(e => e.severity === 'CRITICAL').length.toString(), icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        { label: 'Failed Logins', value: filteredEvents.filter(e => e.description.toLowerCase().includes('failed login')).length.toString(), icon: Lock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Active Sessions', value: '18', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    ];

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'WARNING':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default:
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                    <ShieldAlert size={22} />
                </div>
                <div>
                    <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Event Logs</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">System security, access, and audit trails</p>
                </div>
            </div>

            {/* KPI Ribbon */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {kpiCards.map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {card.value}
                            </div>
                        </div>
                        <div className={`p-3 rounded-xl ${card.bg}`}>
                            <card.icon className={card.color} size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Search, Filter & Action Row */}
            <div className="flex justify-between items-center mb-4 gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Q Search event ID, user, or IP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="pl-8 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
                        >
                            <option value="All">Severity: All</option>
                            <option value="Info">Info</option>
                            <option value="Warning">Warning</option>
                            <option value="Critical">Critical</option>
                        </select>
                        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Export Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsExportOpen(prev => !prev)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <Download size={16} />
                        Export
                        <ChevronDown size={13} className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isExportOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsExportOpen(false)} />
                            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
                                <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Export Options</p>
                                <button
                                    onClick={() => { alert('Exporting as Excel…'); setIsExportOpen(false); }}
                                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                >
                                    <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg flex-shrink-0">
                                        <FileSpreadsheet size={16} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">Export Excel</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Spreadsheet (.xlsx)</p>
                                    </div>
                                </button>
                                <div className="mx-4 border-t border-gray-100 dark:border-gray-700" />
                                <button
                                    onClick={() => { alert('Exporting as PDF…'); setIsExportOpen(false); }}
                                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                >
                                    <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg flex-shrink-0">
                                        <FileText size={16} className="text-red-500 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">Export PDF</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Printable report (.pdf)</p>
                                    </div>
                                </button>
                                <div className="pb-2" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Read-Only Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                            <th className="px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                            <th className="px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Severity</th>
                            <th className="px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event Description</th>
                            <th className="px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actor</th>
                            <th className="px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        {filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(event => (
                            <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-5 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 font-medium">
                                    {event.timestamp}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${getSeverityBadge(event.severity)}`}>
                                        {event.severity}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-gray-900 dark:text-white font-medium">
                                    {event.description}
                                </td>
                                <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                                    {event.actor}
                                </td>
                                <td className="px-5 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                                    {event.ip}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination currentPage={currentPage} totalItems={filteredEvents.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default EventLogs;
