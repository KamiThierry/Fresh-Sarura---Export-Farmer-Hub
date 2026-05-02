import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, Filter, Download, Activity, ChevronDown,
    FileSpreadsheet, FileText, Users, Package, Plane,
    Leaf, Sprout, Calendar, UserCog, Clock
} from 'lucide-react';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────
type LogModule = 'Farmer Management' | 'Crop Planning' | 'Production & QC' | 'Export & Shipments' | 'User Management';

interface LogEntry {
    _id: string;
    timestamp: string;
    module: LogModule;
    action: string;
    actor: string;
    detail: string;
}

// ─── Constants ────────────────────────────────────────────────────
const MODULE_COLORS: Record<LogModule, string> = {
    'Farmer Management': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Crop Planning': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    'Production & QC': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Export & Shipments': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'User Management': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const EventLogs = () => {
    const [events, setEvents] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('All');
    const [actionFilter, setActionFilter] = useState('All');
    const [actorFilter, setActorFilter] = useState('All');
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (moduleFilter !== 'All') params.append('module', moduleFilter);
            if (actionFilter !== 'All') params.append('action', actionFilter);
            if (actorFilter !== 'All') params.append('actor', actorFilter);
            if (searchTerm) params.append('search', searchTerm);

            const res = await api.get(`/event-logs?${params.toString()}`);
            const data = res.data?.data ?? res.data ?? [];

            const mappedData = data.map((log: any) => ({
                _id: log._id,
                timestamp: log.timestamp || log.createdAt,
                module: log.module || 'User Management', // Fallback
                action: log.action || (log.description?.includes('login') ? 'User Login' : 'Action'),
                actor: log.actor || 'System',
                detail: log.description || log.detail || ''
            }));

            setEvents(mappedData);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        } finally {
            setLoading(false);
        }
    }, [moduleFilter, actionFilter, actorFilter, searchTerm]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchLogs();
        }, 300);
        return () => clearTimeout(timeout);
    }, [fetchLogs]);

    const paginatedEvents = events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(events.length / itemsPerPage);

    const summaryStats = [
        { label: 'Total Activities', value: events.length.toString(), icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Farmer Actions', value: events.filter(e => e.module === 'Farmer Management').length.toString(), icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Production Actions', value: events.filter(e => e.module === 'Production & QC').length.toString(), icon: Package, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Export Actions', value: events.filter(e => e.module === 'Export & Shipments').length.toString(), icon: Plane, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ];

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const modules = ['Farmer Management', 'Crop Planning', 'Production & QC', 'Export & Shipments', 'User Management'];
    const actions = useMemo(() => Array.from(new Set(events.map(e => e.action))).sort(), [events]);
    const actors = useMemo(() => Array.from(new Set(events.map(e => e.actor))).sort(), [events]);

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Activity Log</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">All actions performed across Fresh Sarura</p>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsExportOpen(prev => !prev)}
                        className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                        <Download size={16} className="text-green-600" />
                        Export Log
                        <ChevronDown size={13} className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isExportOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsExportOpen(false)} />
                            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
                                <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Select Format</p>
                                <button
                                    onClick={() => { alert('Exporting as Excel…'); setIsExportOpen(false); }}
                                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                >
                                    <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg flex-shrink-0">
                                        <FileSpreadsheet size={16} className="text-green-600" />
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
                                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                                        <FileText size={16} className="text-blue-600" />
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

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {summaryStats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}><stat.icon className={stat.color} size={22} /></div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stat.value}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search actor name, detail, or batch ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                {/* Module Filter */}
                <div className="relative">
                    <Sprout size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                        value={moduleFilter}
                        onChange={(e) => { setModuleFilter(e.target.value); setCurrentPage(1); }}
                        className="pl-8 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                    >
                        <option value="All">All Modules</option>
                        {modules.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                {/* Action Filter */}
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
                        className="pl-8 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                    >
                        <option value="All">All Actions</option>
                        {actions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>

                {/* Actor Filter */}
                <div className="relative">
                    <UserCog size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                        value={actorFilter}
                        onChange={(e) => { setActorFilter(e.target.value); setCurrentPage(1); }}
                        className="pl-8 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                    >
                        <option value="All">All Actors</option>
                        {actors.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                                {['Timestamp', 'Module', 'Action', 'Actor', 'Detail'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {loading ? (
                                <tr><td colSpan={5} className="py-10 text-center text-gray-400 text-sm">Loading activity stream...</td></tr>
                            ) : paginatedEvents.length === 0 ? (
                                <tr><td colSpan={5} className="py-10 text-center text-gray-400 text-sm">No activities found matching filters.</td></tr>
                            ) : (
                                paginatedEvents.map(event => (
                                    <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-5 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                            {formatDate(event.timestamp)}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${MODULE_COLORS[event.module as LogModule] || 'bg-gray-100 text-gray-700'}`}>
                                                {event.module}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-semibold text-gray-900 dark:text-white">{event.action}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-300 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                                    {event.actor.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300">{event.actor}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 italic">
                                            {event.detail}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-400">Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, events.length)} of {events.length}</p>
                        <div className="flex gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="px-3 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setCurrentPage(p)}
                                    className={`px-3 py-1 text-xs rounded-lg border transition-colors ${p === currentPage ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{p}</button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                className="px-3 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventLogs;
