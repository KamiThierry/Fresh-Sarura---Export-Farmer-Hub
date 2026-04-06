import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FileText, Plane, Package, ArrowUpRight, Search, Filter } from 'lucide-react';
import ShipmentBuilderModal from '../components/ShipmentBuilderModal';
import ShipmentDetailsModal from '../components/ShipmentDetailsModal';
import Pagination from '../../shared/component/Pagination';

const MOCK_SHIPMENTS = [
    { id: 'PL-2024-001', date: 'Oct 24, 2023', flight: 'WB300', destination: 'LHR (London)', client: 'Tesco UK', boxes: 120, weight: 480, departureTime: '09:00', duration: '8h 30m', commodities: ['Avocados (Hass)', 'Fine Beans'] }, // Arrived
    { id: 'PL-2024-002', date: 'Oct 25, 2023', flight: 'WB450', destination: 'DXB (Dubai)', client: 'Carrefour', boxes: 85, weight: 340, departureTime: '23:00', duration: '6h 00m', commodities: ['Mangoes (Apple)', 'Chili (Bird Eye)'] }, // Scheduled (if late at night) or In-Transit
    { id: 'PL-2024-003', date: 'Oct 26, 2023', flight: 'WB300', destination: 'AMS (Amsterdam)', client: 'Albert Heijn', boxes: 200, weight: 800, departureTime: '08:00', duration: '9h 00m', commodities: ['Avocados (Hass)', 'Passion Fruit'] }, // Scheduled
    { id: 'PL-2024-004', date: 'Oct 26, 2023', flight: 'ET800', destination: 'ADD (Addis)', client: 'Fresh Gate', boxes: 150, weight: 600, departureTime: '14:30', duration: '5h 15m', commodities: ['Fine Beans', 'Snow Peas'] },
];

const getShipmentStatus = (shipment: any) => {
    // Parse times (Mocking "today" as the base date for demo logic)
    // In real app, we'd use full ISO strings. Here we simulate based on time.
    const now = new Date();
    const currentHour = now.getHours();

    // Parse departure time (e.g., "14:00")
    if (!shipment.departureTime) return { label: 'Scheduled', color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' };

    const [depHour] = shipment.departureTime.split(':').map(Number);
    const durationHours = parseInt(shipment.duration) || 0;

    // Logic
    if (currentHour < depHour) {
        return { label: 'Scheduled', color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' };
    }
    if (currentHour >= depHour && currentHour < (depHour + durationHours)) {
        return { label: 'In-Transit', color: 'bg-amber-500 animate-pulse', bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' };
    }
    return { label: 'Arrived', color: 'bg-green-500', bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' };
};

const Shipments = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // Deep-link from dashboard: ?flight=WB300 pre-fills the search bar
    useEffect(() => {
        const flightParam = searchParams.get('flight');
        if (flightParam) setSearchTerm(flightParam);
    }, [searchParams]);

    // Filtered data — drives table AND stat cards
    const filteredShipments = MOCK_SHIPMENTS.filter(s => {
        const status = getShipmentStatus(s);
        const matchesSearch = searchTerm === '' ||
            s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.flight.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.destination.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || status.label.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    // Derived stats from filtered shipments
    const weeklyVolumeKg = filteredShipments.reduce((sum, s) => sum + s.weight, 0);
    const activeCount = filteredShipments.filter(s => {
        const st = getShipmentStatus(s);
        return st.label === 'Scheduled' || st.label === 'In-Transit';
    }).length;
    const pendingDocsCount = filteredShipments.filter(s => {
        const st = getShipmentStatus(s);
        return st.label === 'Scheduled';
    }).length;

    return (
        <div className="space-y-6 animate-fade-in pb-12">

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage packing lists and flight schedules.</p>
                </div>
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={18} />
                    Create Packing List
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Weekly Volume</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{weeklyVolumeKg.toLocaleString()} <span className="text-lg text-gray-400 font-normal">kg</span></h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                        <Package size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Active Shipments</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{activeCount} <span className="text-lg text-gray-400 font-normal">Active</span></h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <Plane size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Pending Docs</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{pendingDocsCount} <span className="text-lg text-gray-400 font-normal">To Review</span></h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                        <FileText size={24} />
                    </div>
                </div>
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
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
                        <option value="Scheduled">Scheduled</option>
                        <option value="In-Transit">In-Transit</option>
                        <option value="Arrived">Arrived</option>
                    </select>
                </div>
                {(searchTerm || statusFilter !== 'all') && (
                    <button
                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-medium whitespace-nowrap"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Main Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white">Active Export Schedule</h3>
                </div>
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
                            {filteredShipments.length > 0 ? filteredShipments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(shipment => {
                                const status = getShipmentStatus(shipment);
                                return (
                                    <tr
                                        key={shipment.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                                        onClick={() => setSelectedShipment(shipment)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white">{shipment.date}</div>
                                            <div className="text-gray-500 flex items-center gap-1 mt-1">
                                                <Plane size={12} />
                                                {shipment.flight}
                                                <span className="text-xs ml-1 opacity-70">({shipment.departureTime})</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white">{shipment.client}</div>
                                            <div className="text-gray-500 text-xs">{shipment.destination}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium font-mono">
                                                {shipment.id}
                                            </span>
                                            <div className={`flex items-center gap-1.5 mt-1.5 px-2 py-0.5 w-fit rounded ${status.bg} ${status.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                                                <span className="text-xs font-bold">{status.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="font-bold text-gray-900 dark:text-white">{shipment.boxes} Boxes</div>
                                            <div className="text-gray-500 text-xs">{shipment.weight} kg</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                className="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedShipment(shipment);
                                                }}
                                            >
                                                <ArrowUpRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No shipments match your criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalItems={filteredShipments.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>

            {/* Modal */}
            <ShipmentBuilderModal
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />

            <ShipmentDetailsModal
                isOpen={!!selectedShipment}
                onClose={() => setSelectedShipment(null)}
                shipment={selectedShipment}
            />

        </div>
    );
};

export default Shipments;
