import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
    Active: '#22c55e',
    Auditing: '#f59e0b',
    Inactive: '#ef4444',
};

const getRadius = (sizeStr: string): number => {
    const ha = parseFloat(sizeStr) || 1;
    const clamped = Math.min(Math.max(ha, 0.5), 50);
    return 8 + ((clamped - 0.5) / 49.5) * 18;
};

interface FarmPin {
    id: number;
    name: string;
    location: string;
    crop: string;
    size: string;
    status: 'Active' | 'Inactive' | 'Auditing';
    grade: string;
    coords: [number, number];
}

const FARM_PINS: FarmPin[] = [
    { id: 1, name: 'Jean Claude', location: 'Nyagatare, Rwimiyaga', crop: 'French Beans', size: '2.5', status: 'Active', grade: '98% A', coords: [-1.2970, 30.6419] },
    { id: 2, name: 'Kirehe Co-op', location: 'Kirehe, Gahara', crop: 'Avocados (Hass)', size: '45.0', status: 'Active', grade: '95% A', coords: [-2.2567, 30.6648] },
    { id: 3, name: 'Marie Claire', location: 'Musanze, Kinigi', crop: 'Passion Fruit', size: '1.2', status: 'Inactive', grade: '-', coords: [-1.4989, 29.6337] },
    { id: 4, name: 'Bugesera Outgrowers', location: 'Bugesera, Mayange', crop: 'Chili Peppers', size: '15.0', status: 'Active', grade: '92% A', coords: [-2.0976, 30.2456] },
    { id: 5, name: 'Robert / Almond', location: 'Rwamagana, Muhazi', crop: 'Mangoes', size: '3.0', status: 'Auditing', grade: '88% A', coords: [-1.9487, 30.4388] },
    { id: 6, name: 'Rusizi Organic', location: 'Rusizi, Kamembe', crop: 'Mixed Veg', size: '8.5', status: 'Active', grade: '99% A', coords: [-2.4757, 28.9082] },
];

const STATUS_LEGEND = [
    { color: '#22c55e', label: 'Active', sub: 'Supplying produce' },
    { color: '#f59e0b', label: 'Auditing', sub: 'Under inspection' },
    { color: '#ef4444', label: 'Inactive', sub: 'Not supplying' },
];

const SIZE_LEGEND = [
    { r: 8, label: '~1 Ha' },
    { r: 14, label: '~15 Ha' },
    { r: 20, label: '~45 Ha' },
];

const FarmNetworkMap = () => (
    /* Two sibling cards side-by-side — no shared outer wrapper */
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">

        {/* ── LEFT: Legend card ── */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-6">

            {/* Card title */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <MapIcon size={15} className="text-green-500 flex-shrink-0" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Farm Status Levels</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                    Colour indicates current supplier compliance status.
                </p>
            </div>

            {/* Status colour key */}
            <div className="space-y-3">
                {STATUS_LEGEND.map(({ color, label, sub }) => (
                    <div key={label} className="flex items-start gap-3">
                        <span
                            className="mt-0.5 w-3.5 h-3.5 rounded-full flex-shrink-0"
                            style={{ background: color, boxShadow: `0 0 0 2px white, 0 0 0 3.5px ${color}66` }}
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">{label}</p>
                            <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-700" />

            {/* Size key */}
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Circle = Land Area</p>
                <div className="flex items-end gap-5">
                    {SIZE_LEGEND.map(({ r, label }) => (
                        <div key={label} className="flex flex-col items-center gap-1.5">
                            <span
                                className="block rounded-full"
                                style={{
                                    width: r * 2, height: r * 2,
                                    background: '#22c55e',
                                    border: '2px solid white',
                                    boxShadow: '0 0 0 1.5px #22c55e88',
                                    opacity: 0.85,
                                }}
                            />
                            <span className="text-[10px] text-gray-400 text-center leading-tight">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Farms count — pinned to bottom */}
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-0.5">Mapped Farms</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{FARM_PINS.length}</p>
            </div>
        </div>

        {/* ── RIGHT: Map card ── */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">

            {/* Map card header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                <div>
                    <h2 className="text-[17px] font-bold text-gray-900 dark:text-white">
                        Farm Network — Geospatial View
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Click any marker to view farm details.
                    </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0 ml-4 mt-0.5">
                    Live View
                </span>
            </div>

            {/* Leaflet map */}
            <div className="flex-1 h-[420px]">
                <MapContainer
                    center={[-1.9403, 29.8739]}
                    zoom={8}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ZoomControl position="topleft" />

                    {FARM_PINS.map(farm => {
                        const color = STATUS_COLOR[farm.status] ?? '#9CA3AF';
                        const radius = getRadius(farm.size);
                        return (
                            <CircleMarker
                                key={farm.id}
                                center={farm.coords}
                                radius={radius}
                                pathOptions={{
                                    fillColor: color,
                                    color: 'white',
                                    weight: 2,
                                    opacity: 1,
                                    fillOpacity: 0.85,
                                }}
                            >
                                <Tooltip direction="top" offset={[0, -radius]} sticky>
                                    <span className="font-semibold">{farm.name}</span>
                                </Tooltip>
                                <Popup>
                                    <div style={{ minWidth: 190, fontFamily: 'Inter, sans-serif' }}>
                                        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{farm.name}</p>
                                        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>📍 {farm.location}</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
                                            <div>
                                                <p style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>Main Crop</p>
                                                <p style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{farm.crop}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>Land Size</p>
                                                <p style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{farm.size} Ha</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>Performance</p>
                                                <p style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>⭐ {farm.grade}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>Status</p>
                                                <span style={{
                                                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, display: 'inline-block',
                                                    backgroundColor: color + '22', color, border: `1px solid ${color}55`,
                                                }}>
                                                    {farm.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>

    </div>
);

export default FarmNetworkMap;
