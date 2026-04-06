import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Truck, Calendar, MapPin, ArrowUpRight } from 'lucide-react';

type TabId = 'outbound' | 'inbound';

const FLIGHTS = [
    { id: 'WB300', airline: 'RwandAir', dest: 'London (LHR)', cutoff: '14:00 Today', weight: '850 kg', status: 'Closing', statusColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    { id: 'KL537', airline: 'KLM', dest: 'Amsterdam (AMS)', cutoff: '09:00 Tomorrow', weight: '1,200 kg', status: 'Open', statusColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { id: 'WB305', airline: 'RwandAir', dest: 'Dubai (DXB)', cutoff: '06:00 Yesterday', weight: '2,100 kg', status: 'Departed', statusColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
];

const TRUCKS = [
    {
        id: 'truck-a',
        focusParam: 'trip-101',
        truck: 'Truck A',
        driver: 'John M.',
        route: 'Kayonza → KGL Packhouse',
        location: 'Rwamagana',
        eta: '14:30 Today',
        status: 'En Route',
        statusColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
        id: 'truck-b',
        focusParam: 'trip-102',
        truck: 'Truck B',
        driver: 'Peter K.',
        route: 'Bugesera → KGL Packhouse',
        location: 'Nyamata',
        eta: '15:15 Today',
        status: 'Delayed',
        statusColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
        id: 'truck-c',
        focusParam: 'trip-103',
        truck: 'Truck C',
        driver: 'Eric N.',
        route: 'Simbi Farm → KGL Packhouse',
        location: 'Simbi Farm',
        eta: '—',
        status: 'Loading',
        statusColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    },
];

const ROW_HOVER = 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer';

const UpcomingDepartures = () => {
    const [activeTab, setActiveTab] = useState<TabId>('outbound');
    const navigate = useNavigate();

    const handleFlightClick = (flightId: string) => {
        // Navigate to the Shipments page; pass the flight ID as a search param
        // so the page can pre-filter or highlight it.
        navigate(`/logistics/shipments?flight=${flightId}`);
    };

    const handleTruckClick = (focusParam: string) => {
        // Navigate to Collections with the focus param so the existing
        // deep-link banner on Collections.tsx fires for the matching trip.
        navigate(`/logistics/collections?focus=${focusParam}`);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-5 pt-5 pb-0 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Plane size={18} className="text-purple-500" />
                        Active Logistics &amp; Dispatch
                    </h3>

                    {/* Dynamic top-right link */}
                    {activeTab === 'outbound' ? (
                        <button
                            onClick={() => navigate('/logistics/shipments')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
                        >
                            View All Shipments <ArrowUpRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/logistics/collections')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
                        >
                            View All Routes <ArrowUpRight size={14} />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('outbound')}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'outbound'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                    >
                        Outbound (Flights)
                    </button>
                    <button
                        onClick={() => setActiveTab('inbound')}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'inbound'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                    >
                        Inbound (Fleet)
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="overflow-x-auto">

                {/* --- Outbound Flights Table --- */}
                {activeTab === 'outbound' && (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                <th className="px-6 py-4">Flight</th>
                                <th className="px-6 py-4">Destination</th>
                                <th className="px-6 py-4">Cut-off Time</th>
                                <th className="px-6 py-4">Booked Weight</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {FLIGHTS.map((flight) => (
                                <tr
                                    key={flight.id}
                                    className={ROW_HOVER}
                                    onClick={() => handleFlightClick(flight.id)}
                                    title={`Open ${flight.airline} ${flight.id} in Export Shipments`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                                                <Plane size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{flight.airline}</p>
                                                <p className="text-xs text-gray-500 font-mono">{flight.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {flight.dest}
                                    </td>
                                    <td className="px-6 py-4 text-sm flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span className={flight.cutoff.includes('Today') ? 'text-red-500 font-semibold' : 'text-gray-500'}>
                                            {flight.cutoff}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                        {flight.weight}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${flight.statusColor}`}>
                                            {flight.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* --- Inbound Fleet Table --- */}
                {activeTab === 'inbound' && (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                <th className="px-6 py-4">Truck / Driver</th>
                                <th className="px-6 py-4">Route</th>
                                <th className="px-6 py-4">Current Location</th>
                                <th className="px-6 py-4">ETA</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {TRUCKS.map((truck) => (
                                <tr
                                    key={truck.id}
                                    className={ROW_HOVER}
                                    onClick={() => handleTruckClick(truck.focusParam)}
                                    title={`Open ${truck.truck} in Collection Routes`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                                                <Truck size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{truck.truck}</p>
                                                <p className="text-xs text-gray-500">{truck.driver}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {truck.route}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={13} className="text-gray-400 shrink-0" />
                                            {truck.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={truck.eta === '—' ? 'text-gray-400' : truck.eta.includes('Today') ? 'text-gray-700 dark:text-gray-300 font-semibold' : 'text-gray-500'}>
                                            {truck.eta}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${truck.statusColor}`}>
                                            {truck.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>
        </div>
    );
};

export default UpcomingDepartures;
