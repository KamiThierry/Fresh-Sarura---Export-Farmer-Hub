import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FileText, Plane, Package, ArrowUpRight, 
         Search, Filter, Loader2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import ShipmentBuilderModal from '../components/ShipmentBuilderModal';
import ShipmentDetailsModal from '../components/ShipmentDetailsModal';
import Pagination from '../../shared/component/Pagination';
import { api } from '../../../lib/api';

// ── Single source of truth for status display ─────────────────────
const STATUS_CONFIG: Record<string, {
    label: string; dot: string;
    bg: string; text: string;
}> = {
    Draft: {
        label: 'Draft',
        dot: 'bg-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-700/30',
        text: 'text-gray-600 dark:text-gray-400',
    },
    PackingListGenerated: {
        label: 'Scheduled',
        dot: 'bg-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
    },
    Departed: {
        label: 'In Transit',
        dot: 'bg-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-300',
    },
    Shipped: {
        label: 'Shipped',
        dot: 'bg-green-500',
        bg: 'bg-green-50 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-300',
    },
    Cancelled: {
        label: 'Cancelled',
        dot: 'bg-red-500',
        bg: 'bg-red-50 dark:bg-red-900/30',
        text: 'text-red-600 dark:text-red-400',
    },
};

// Departure overdue — scheduled but flight time passed
const isDepartureOverdue = (shipment: any): boolean => {
    if (shipment.status !== 'PackingListGenerated') return false;
    const dep = new Date(shipment.departureDate);
    if (shipment.departureTime) {
        const [h, m] = shipment.departureTime.split(':').map(Number);
        dep.setHours(h, m, 0, 0);
    }
    return dep < new Date();
};

// Arrival overdue — in transit but estimated arrival passed
const isArrivalOverdue = (shipment: any): boolean => {
    if (shipment.status !== 'Departed') return false;
    if (!shipment.departedAt) return false;
    const arrival = new Date(shipment.departedAt);
    arrival.setHours(arrival.getHours() + (shipment.estimatedFlightHours || 8));
    return arrival < new Date();
};

const Shipments = () => {
    const [shipments, setShipments]           = useState<any[]>([]);
    const [loading, setLoading]               = useState(true);
    const [isBuilderOpen, setIsBuilderOpen]   = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<any>(null);
    const [searchTerm, setSearchTerm]         = useState('');
    const [statusFilter, setStatusFilter]     = useState('all');
    const [searchParams]                      = useSearchParams();
    const [currentPage, setCurrentPage]       = useState(1);
    const itemsPerPage = 5;

    const fetchShipments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/shipments');
            const data = res.data?.data ?? res.data ?? [];
            setShipments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch shipments:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchShipments(); }, [fetchShipments]);

    useEffect(() => {
        const flightParam = searchParams.get('flight');
        if (flightParam) setSearchTerm(flightParam);
    }, [searchParams]);

    const filteredShipments = shipments.filter(s => {
        const matchesSearch = searchTerm === '' ||
            s.plNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.destination?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats derived from real status field
    const weeklyVolumeKg  = shipments.reduce((sum, s) => sum + (s.totalWeightKg || 0), 0);
    const activeCount     = shipments.filter(s =>
        s.status === 'PackingListGenerated' || s.status === 'Departed'
    ).length;
    const departureOverdueCount = shipments.filter(isDepartureOverdue).length;
    const arrivalOverdueCount   = shipments.filter(isArrivalOverdue).length;

    const pendingDocsCount = shipments.filter(s =>
        s.status === 'PackingListGenerated' || s.status === 'Departed'
    ).length;

    return (
        <div className="space-y-6 animate-fade-in pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                        Manage packing lists and flight schedules.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchShipments}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <RefreshCw size={15} /> Refresh
                    </button>
                    <button
                        onClick={() => setIsBuilderOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={18} /> Create Packing List
                    </button>
                </div>
            </div>

            {/* Overdue alert banner */}
            {departureOverdueCount > 0 && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                    <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                            {departureOverdueCount} scheduled shipment{departureOverdueCount > 1 ? 's have' : ' has'} passed departure time
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                            Open the shipment and confirm whether the flight departed or was cancelled.
                        </p>
                    </div>
                </div>
            )}

            {arrivalOverdueCount > 0 && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl">
                    <CheckCircle size={18} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-green-700 dark:text-green-400">
                            {arrivalOverdueCount} in-transit shipment{arrivalOverdueCount > 1 ? 's have' : ' has'} reached estimated arrival time
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                            Open the shipment and confirm cargo has been shipped.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: 'Weekly Volume',
                        value: `${weeklyVolumeKg.toLocaleString()} kg`,
                        icon: Package,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-100 dark:bg-emerald-900/30'
                    },
                    {
                        label: 'Active Shipments',
                        value: `${activeCount} Active`,
                        icon: Plane,
                        color: 'text-blue-600',
                        bg: 'bg-blue-100 dark:bg-blue-900/30'
                    },
                    {
                        label: 'Pending Docs',
                        value: `${pendingDocsCount} To Review`,
                        icon: FileText,
                        color: 'text-amber-600',
                        bg: 'bg-amber-100 dark:bg-amber-900/30'
                    },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stat.value}</div>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search PL #, Flight or Client..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="relative">
                    <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="pl-9 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="PackingListGenerated">Scheduled</option>
                        <option value="Departed">In Transit</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                {(searchTerm || statusFilter !== 'all') && (
                    <button
                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCurrentPage(1); }}
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-medium whitespace-nowrap"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white">Active Export Schedule</h3>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={28} className="animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Date / Flight</th>
                                    <th className="px-6 py-4 font-semibold">Client / Destination</th>
                                    <th className="px-6 py-4 font-semibold">PL Number</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-center">Volume</th>
                                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredShipments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <Plane size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                            <p className="text-gray-400 text-sm font-medium">No shipments found.</p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                Mark export batches as Ready for Export, then create a packing list.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredShipments
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map(shipment => {
                                            const cfg      = STATUS_CONFIG[shipment.status] || STATUS_CONFIG.Draft;
                                            const depOverdue = isDepartureOverdue(shipment);
                                            const arrOverdue = isArrivalOverdue(shipment);
                                            const overdue    = depOverdue || arrOverdue;

                                            return (
                                                <tr
                                                    key={shipment._id}
                                                    onClick={() => setSelectedShipment(shipment)}
                                                    className={`transition-colors cursor-pointer ${
                                                        arrOverdue
                                                            ? 'bg-green-50/40 dark:bg-green-900/5 hover:bg-green-50 dark:hover:bg-green-900/10'
                                                            : depOverdue
                                                                ? 'bg-amber-50/40 dark:bg-amber-900/5 hover:bg-amber-50 dark:hover:bg-amber-900/10'
                                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                    }`}
                                                >
                                                    {/* Date / Flight */}
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900 dark:text-white">
                                                            {new Date(shipment.departureDate).toLocaleDateString('en-GB', {
                                                                day: '2-digit', month: 'short', year: 'numeric'
                                                            })}
                                                        </div>
                                                        <div className="text-gray-500 flex items-center gap-1 mt-0.5 text-xs">
                                                            <Plane size={11} />
                                                            {shipment.flightNumber}
                                                            {shipment.departureTime && (
                                                                <span className={`ml-1 ${overdue ? 'text-amber-600 dark:text-amber-400 font-bold' : 'opacity-70'}`}>
                                                                    ({shipment.departureTime})
                                                                    {overdue && ' ⚠'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Client / Destination */}
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900 dark:text-white">
                                                            {shipment.clientName || '—'}
                                                        </div>
                                                        <div className="text-gray-500 text-xs mt-0.5">{shipment.destination}</div>
                                                    </td>

                                                    {/* PL Number — standalone column */}
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium font-mono">
                                                            {shipment.plNumber}
                                                        </span>
                                                    </td>

                                                    {/* Status — own column, driven by real backend status */}
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot} ${
                                                                shipment.status === 'Departed' ? 'animate-pulse' : ''
                                                            }`} />
                                                            {cfg.label}
                                                        </span>
                                                        {depOverdue && (
                                                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
                                                                <AlertTriangle size={9} /> Confirm departure
                                                            </p>
                                                        )}
                                                        {arrOverdue && (
                                                            <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold mt-1 flex items-center gap-1">
                                                                <CheckCircle size={9} /> Confirm shipped
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Volume */}
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="font-bold text-gray-900 dark:text-white">
                                                            {shipment.totalBoxes} {shipment.totalBoxes === 1 ? 'Box' : 'Boxes'}
                                                        </div>
                                                        <div className="text-gray-500 text-xs mt-0.5">
                                                            {shipment.totalWeightKg?.toLocaleString()} kg
                                                        </div>
                                                    </td>

                                                    {/* Action */}
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            className="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            onClick={e => { e.stopPropagation(); setSelectedShipment(shipment); }}
                                                        >
                                                            <ArrowUpRight size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredShipments.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            <ShipmentBuilderModal
                isOpen={isBuilderOpen}
                onClose={() => setIsBuilderOpen(false)}
                onSuccess={() => { setIsBuilderOpen(false); fetchShipments(); }}
            />

            <ShipmentDetailsModal
                isOpen={!!selectedShipment}
                onClose={() => setSelectedShipment(null)}
                shipment={selectedShipment}
                onStatusChange={fetchShipments}  // renamed from onDispatched
            />
        </div>
    );
};

export default Shipments;
