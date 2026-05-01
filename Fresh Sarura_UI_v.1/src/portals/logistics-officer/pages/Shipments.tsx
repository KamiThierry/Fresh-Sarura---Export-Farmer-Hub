import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FileText, Plane, Package, ArrowUpRight, Search, Filter, Loader2, RefreshCw } from 'lucide-react';
import ShipmentBuilderModal from '../components/ShipmentBuilderModal';
import ShipmentDetailsModal from '../components/ShipmentDetailsModal';
import Pagination from '../../shared/component/Pagination';
import { api } from '../../../lib/api';

const getShipmentStatus = (shipment: any) => {
    if (shipment.status === 'Dispatched') {
        return { label: 'Dispatched', color: 'bg-green-500', bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' };
    }
    if (shipment.status === 'Draft') {
        return { label: 'Draft', color: 'bg-gray-400', bg: 'bg-gray-50 dark:bg-gray-700/30', text: 'text-gray-600 dark:text-gray-400' };
    }
    // PackingListGenerated — check if departure is past
    const now = new Date();
    const dep = new Date(shipment.departureDate);
    if (dep > now) {
        return { label: 'Scheduled', color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' };
    }
    return { label: 'In-Transit', color: 'bg-amber-500 animate-pulse', bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' };
};

const Shipments = () => {
    const [shipments, setShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchShipments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/shipments');
            setShipments(res.data || []);
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
        const status = getShipmentStatus(s);
        const matchesSearch = searchTerm === '' ||
            s.plNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.destination?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            status.label.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const weeklyVolumeKg = shipments.reduce((sum, s) => sum + (s.totalWeightKg || 0), 0);
    const activeCount = shipments.filter(s => {
        const st = getShipmentStatus(s);
        return st.label === 'Scheduled' || st.label === 'In-Transit';
    }).length;
    const pendingDocsCount = shipments.filter(s => s.status === 'PackingListGenerated').length;

    return (
        <div className="space-y-6 animate-fade-in pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage packing lists and flight schedules.</p>
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

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Weekly Volume', value: `${weeklyVolumeKg.toLocaleString()} kg`, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                    { label: 'Active Shipments', value: `${activeCount} Active`, icon: Plane, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                    { label: 'Pending Docs', value: `${pendingDocsCount} To Review`, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
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
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search PL #, Flight or Client..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="relative">
                    <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="pl-9 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in-transit">In-Transit</option>
                        <option value="dispatched">Dispatched</option>
                    </select>
                </div>
                {(searchTerm || statusFilter !== 'all') && (
                    <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium whitespace-nowrap">
                        Clear
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
                                    <th className="px-6 py-4 font-semibold">Ref Numbers</th>
                                    <th className="px-6 py-4 font-semibold text-center">Volume</th>
                                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredShipments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <Plane size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                            <p className="text-gray-400 text-sm font-medium">No shipments yet.</p>
                                            <p className="text-gray-400 text-xs mt-1">Mark export batches as Ready for Export, then create a packing list.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredShipments
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map(shipment => {
                                            const status = getShipmentStatus(shipment);
                                            return (
                                                <tr
                                                    key={shipment._id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                                    onClick={() => setSelectedShipment(shipment)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900 dark:text-white">
                                                            {new Date(shipment.departureDate).toLocaleDateString('en-RW', { dateStyle: 'medium' })}
                                                        </div>
                                                        <div className="text-gray-500 flex items-center gap-1 mt-1">
                                                            <Plane size={12} />
                                                            {shipment.flightNumber}
                                                            {shipment.departureTime && <span className="text-xs ml-1 opacity-70">({shipment.departureTime})</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900 dark:text-white">{shipment.clientName || '—'}</div>
                                                        <div className="text-gray-500 text-xs">{shipment.destination}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium font-mono">
                                                            {shipment.plNumber}
                                                        </span>
                                                        <div className={`flex items-center gap-1.5 mt-1.5 px-2 py-0.5 w-fit rounded ${status.bg} ${status.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                                                            <span className="text-xs font-bold">{status.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="font-bold text-gray-900 dark:text-white">{shipment.totalBoxes} Boxes</div>
                                                        <div className="text-gray-500 text-xs">{shipment.totalWeightKg?.toLocaleString()} kg</div>
                                                    </td>
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
                <Pagination currentPage={currentPage} totalItems={filteredShipments.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
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
                onDispatched={fetchShipments}
            />
        </div>
    );
};

export default Shipments;
