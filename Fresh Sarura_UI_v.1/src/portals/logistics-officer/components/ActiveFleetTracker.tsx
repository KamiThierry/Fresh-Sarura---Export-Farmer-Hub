import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { Navigation, Truck, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

// ── Same color logic as RoutePreviewMap ─────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
    'Loading': '#22c55e',   // green  — harvest ready / loading
    'En Route': '#f59e0b',   // amber  — truck en route
    'Delayed': '#ef4444',   // red    — pickup delayed
    'Transfer': '#2563eb',   // blue   — HQ / Kigali transfer
};

const getColor = (status: string) => STATUS_COLOR[status] ?? '#22c55e';

// ── HQ location ──────────────────────────────────────────────────────────────
const HQ: [number, number] = [-1.9441, 30.0619];

const ActiveFleetTracker = () => {
    const TRIPS = [
        { id: '101', title: 'Simbi Farm Pickup', status: 'Loading', driver: 'John (Truck A)', color: 'bg-yellow-500', lat: -2.333, lng: 29.650 },
        { id: '102', title: 'Kigali Transfer', status: 'En Route', driver: 'Peter (Truck B)', color: 'bg-blue-500', lat: -1.970, lng: 30.100 },
    ];

    const FARM = { lat: -2.333, lng: 29.650, title: 'Simbi Farm', status: 'Loading' };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden h-[450px] relative group flex flex-col">

            {/* Map Container */}
            <div className="flex-1 relative z-0">
                <MapContainer
                    center={[-1.9403, 29.8739]}
                    zoom={9}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* ── Trip (truck) markers ─────────────────────────── */}
                    {TRIPS.map(trip => {
                        const color = getColor(trip.status);
                        return (
                            <CircleMarker
                                key={trip.id}
                                center={[trip.lat, trip.lng]}
                                radius={14}
                                pathOptions={{
                                    fillColor: color,
                                    color: 'white',
                                    weight: 2.5,
                                    fillOpacity: 0.92,
                                }}
                            >
                                <Tooltip direction="top" offset={[0, -16]} sticky>
                                    <span style={{ fontWeight: 600 }}>{trip.title}</span>
                                </Tooltip>
                                <Popup>
                                    <div style={{ minWidth: 160 }}>
                                        <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{trip.title}</p>
                                        <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>🚛 {trip.driver}</p>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            borderRadius: 9999,
                                            fontSize: 10,
                                            fontWeight: 700,
                                            backgroundColor: color + '22',
                                            color: color,
                                            border: `1px solid ${color}55`,
                                        }}>
                                            {trip.status}
                                        </span>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}

                    {/* ── Farm marker ──────────────────────────────────── */}
                    <CircleMarker
                        center={[FARM.lat, FARM.lng]}
                        radius={10}
                        pathOptions={{
                            fillColor: getColor(FARM.status),
                            color: 'white',
                            weight: 2,
                            fillOpacity: 0.75,
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -12]} sticky>
                            <span style={{ fontWeight: 600 }}>{FARM.title}</span>
                        </Tooltip>
                        <Popup>
                            <p style={{ fontWeight: 700, fontSize: 13 }}>{FARM.title}</p>
                        </Popup>
                    </CircleMarker>

                    {/* ── HQ marker ────────────────────────────────────── */}
                    <CircleMarker
                        center={HQ}
                        radius={12}
                        pathOptions={{
                            fillColor: '#2563eb',
                            color: 'white',
                            weight: 2.5,
                            fillOpacity: 0.92,
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -14]} sticky>
                            <span style={{ fontWeight: 600 }}>Kigali Packhouse (HQ)</span>
                        </Tooltip>
                        <Popup>
                            <p style={{ fontWeight: 700, fontSize: 13 }}>🏭 Kigali Packhouse (HQ)</p>
                        </Popup>
                    </CircleMarker>

                </MapContainer>

                {/* Floating "Active Trips" card — unchanged */}
                <div className="absolute top-4 right-4 w-72 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-[999]">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                        <Navigation size={16} className="text-blue-600" />
                        Active Trips
                    </h3>

                    <div className="space-y-3">
                        {TRIPS.map((trip) => (
                            <div key={trip.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer text-left">
                                <div className={`mt-1.5 w-2 h-2 rounded-full ${trip.color}`}></div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{trip.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                        <span className={`font-medium ${trip.status === 'Loading' ? 'text-yellow-600' : 'text-blue-600'}`}>
                                            {trip.status}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Truck size={10} /> {trip.driver}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* "Open Full Route Map" button — unchanged */}
            <div className="bg-white dark:bg-gray-800 p-3 border-t border-gray-100 dark:border-gray-700 flex justify-center sticky bottom-0 z-10">
                <Link to="/logistics/collections" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg transition-colors">
                    <ExternalLink size={16} />
                    Open Full Route Map
                </Link>
            </div>
        </div>
    );
};

export default ActiveFleetTracker;
