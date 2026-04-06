import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Truck, MapPin, Search, Filter, CheckCircle2, AlertTriangle, ArrowRight, Plane, Package, Phone, X as XIcon, X, UserCircle, Map as MapIcon } from 'lucide-react';
import RoutePreviewMap from '../components/RoutePreviewMap';


const HARVEST_DEMAND = [
    { id: '1', farm: 'Simbi Farm A', crop: 'Avocado (Hass)', weight: 2000, status: 'Harvested 4h ago', urgency: 'low', lat: -2.333, lng: 29.650 },
    { id: '2', farm: 'Simbi Farm B', crop: 'Avocado (Fuerte)', weight: 1500, status: 'Harvested 48h ago', urgency: 'high', lat: -2.350, lng: 29.660 },
    { id: '3', farm: 'Kigali Urban Farm', crop: 'Chili (Bird\u2019s Eye)', weight: 500, status: 'Harvested 2h ago', urgency: 'low', lat: -1.970, lng: 30.100 },
];

const FLEET_SUPPLY = [
    { id: 'T1', driver: 'John Mugisha', truck: 'RAC 123 A', type: '5 Ton', capacity: 5000, currentLoad: 0, status: 'Available', lat: -1.950, lng: 30.060 },
    { id: 'T2', driver: 'Peter Nioroge', truck: 'RAB 456 B', type: 'Pickup', capacity: 1000, currentLoad: 0, status: 'Available', lat: -2.300, lng: 29.600 },
    { id: 'T3', driver: 'Sarah Uwase', truck: 'RAC 789 C', type: '5 Ton', capacity: 5000, currentLoad: 2500, status: 'On Trip', lat: -1.500, lng: 30.000 },
];

const AIRPORT_TRANSFERS = [
    { id: 'A1', farm: 'Kigali International (KGL)', destination: 'Kigali International (KGL)', flight: 'WB300', awb: '123-4567', weight: 1804, skids: 9, departure: '23:00', status: 'Departs in 3h', urgency: 'high', lat: -1.963042, lng: 30.135014 },
    { id: 'A2', farm: 'Kigali International (KGL)', destination: 'Kigali International (KGL)', flight: 'ET800', awb: '890-1234', weight: 4500, skids: 20, departure: '08:00', status: 'Tomorrow', urgency: 'low', lat: -1.963042, lng: 30.135014 },
];

const Collections = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const focusTrip = searchParams.get('focus');
    const assignAction = searchParams.get('action');
    const assignFarm = searchParams.get('farm');

    const [dispatchMode, setDispatchMode] = useState<'farm' | 'airport'>('farm');
    const [selectedFarms, setSelectedFarms] = useState<string[]>([]);
    const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
    const [dispatched, setDispatched] = useState(false);
    const [regionFilter, setRegionFilter] = useState('All Regions');
    const [vehicleFilter, setVehicleFilter] = useState('All Vehicles');

    // Filter Logic
    const filteredDemand = HARVEST_DEMAND.filter(item => regionFilter === 'All Regions' || item.farm.includes(regionFilter));
    const filteredTransfers = AIRPORT_TRANSFERS.filter(item => regionFilter === 'All Regions' || item.farm.includes(regionFilter));
    const filteredFleet = FLEET_SUPPLY.filter(item => vehicleFilter === 'All Vehicles' || item.status === vehicleFilter);

    // Auto-select Kayonza Farm when navigated from deep link
    useEffect(() => {
        if (assignAction === 'assign' && assignFarm === 'kayonza') {
            setDispatchMode('farm');
            // Simbi Farm A is the closest match in mock data; select it to simulate Kayonza
            setSelectedFarms(['1']);
        }
    }, [assignAction, assignFarm]);

    const toggleFarmSelection = (id: string) => {
        setSelectedFarms(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    const handleDiscard = () => {
        setSelectedFarms([]);
        setSelectedTruck(null);
    };

    const totalWeight = selectedFarms.reduce((sum, id) => {
        const item = dispatchMode === 'farm'
            ? HARVEST_DEMAND.find(f => f.id === id)
            : AIRPORT_TRANSFERS.find(a => a.id === id);
        return sum + (item?.weight || 0);
    }, 0);

    const selectedTruckData = FLEET_SUPPLY.find(t => t.id === selectedTruck);
    const isOverweight = selectedTruckData ? totalWeight > selectedTruckData.capacity : false;
    const canDispatch = selectedFarms.length > 0 && selectedTruck && !isOverweight;

    // Mock distance calculation
    const routeDistance = selectedFarms.length > 0 && selectedTruck ? Math.floor(Math.random() * 50) + 10 : 0;

    const handleDispatch = () => {
        setDispatched(true);
        setTimeout(() => {
            setDispatched(false);
            handleDiscard();
            alert(`Dispatch Link sent to ${selectedTruckData?.driver}`);
        }, 2000);
    };

    return (
        <div className="space-y-4 animate-fade-in pb-24 relative min-h-[calc(100vh-100px)] flex flex-col">

            {/* ── Deep-link: Trip #101 Focus Banner ── */}
            {focusTrip === 'trip-101' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 shrink-0">
                    <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400 flex-shrink-0">
                        <Truck size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base font-bold text-amber-900 dark:text-amber-300">Trip #101 — Delayed</h2>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-300 rounded-full uppercase tracking-wide">30m Behind</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className="flex items-center gap-2">
                                <UserCircle size={16} className="text-amber-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase">Driver</p>
                                    <p className="text-sm font-bold text-amber-900 dark:text-white">Peter Nioroge</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-amber-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase">Phone</p>
                                    <p className="text-sm font-bold text-amber-900 dark:text-white">+250 788 456 789</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-amber-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase">Status</p>
                                    <p className="text-sm font-bold text-amber-900 dark:text-white">En Route — Simbi Farm</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSearchParams({})}
                        className="p-1.5 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800/50 text-amber-500 transition-colors flex-shrink-0"
                    >
                        <XIcon size={16} />
                    </button>
                </div>
            )}

            {/* ── Deep-link: Assign Vehicle Banner ── */}
            {assignAction === 'assign' && assignFarm === 'kayonza' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 shrink-0">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <Package size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base font-bold text-blue-900 dark:text-blue-300">Assign Vehicle — Kayonza Farm</h2>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-200 dark:bg-blue-800/60 text-blue-800 dark:text-blue-300 rounded-full uppercase tracking-wide">1.2 Tons Ready</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                            A harvest of <strong>1,200 kg</strong> is ready for pickup. Select a truck from the Fleet panel below and confirm dispatch.
                        </p>
                        <p className="text-xs text-blue-500 dark:text-blue-500 mt-2 flex items-center gap-1">
                            <ArrowRight size={12} /> Farm pre-selected in the dispatch queue below.
                        </p>
                    </div>
                    <button
                        onClick={() => setSearchParams({})}
                        className="p-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-500 transition-colors flex-shrink-0"
                    >
                        <XIcon size={16} />
                    </button>
                </div>
            )}

            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collection Dispatch Board</h1>
                    <p className="text-gray-500 dark:text-gray-400">Assign ready harvests to available trucks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        <select
                            value={regionFilter}
                            onChange={(e) => setRegionFilter(e.target.value)}
                            className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="All Regions">Filter: All Regions</option>
                            <option value="Simbi">Simbi</option>
                            <option value="Kigali">Kigali</option>
                            <option value="Kayonza">Kayonza</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Truck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        <select
                            value={vehicleFilter}
                            onChange={(e) => setVehicleFilter(e.target.value)}
                            className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="All Vehicles">Filter: All Vehicles</option>
                            <option value="Available">Available</option>
                            <option value="On Trip">On Trip</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content Area (Split View) */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">

                {/* Top Section: Lists (Kanban) - 60% Height approx */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[450px] shrink-0">

                    {/* Left Panel: Harvest Demand */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    Dispatch Queue
                                </h2>
                                <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-lg mt-2 w-fit">
                                    <button
                                        onClick={() => { setDispatchMode('farm'); setSelectedFarms([]); setSelectedTruck(null); }}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${dispatchMode === 'farm' ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <span>🌾</span> Farm Pickups
                                    </button>
                                    <button
                                        onClick={() => { setDispatchMode('airport'); setSelectedFarms([]); setSelectedTruck(null); }}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${dispatchMode === 'airport' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <span>✈️</span> Airport Transfers
                                    </button>
                                </div>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-300">
                                {dispatchMode === 'farm' ? filteredDemand.length : filteredTransfers.length}
                            </span>
                        </div>

                        <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                            {dispatchMode === 'farm' ? (
                                filteredDemand.map(farm => (
                                    <div
                                        key={farm.id}
                                        onClick={() => toggleFarmSelection(farm.id)}
                                        className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all hover:shadow-md
                                            ${selectedFarms.includes(farm.id) ? 'border-green-500 ring-1 ring-green-500' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                    ${selectedFarms.includes(farm.id) ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                                                    {selectedFarms.includes(farm.id) && <CheckCircle2 size={14} className="text-white" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white">{farm.farm}</h3>
                                                    <p className="text-sm text-gray-500">{farm.crop}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                            {(farm.weight).toLocaleString()} kg
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1
                                                            ${farm.urgency === 'high' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                            {farm.urgency === 'high' && <AlertTriangle size={10} />}
                                                            {farm.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                filteredTransfers.map(transfer => (
                                    <div
                                        key={transfer.id}
                                        onClick={() => toggleFarmSelection(transfer.id)}
                                        className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all hover:shadow-md
                                            ${selectedFarms.includes(transfer.id) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                    ${selectedFarms.includes(transfer.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
                                                    {selectedFarms.includes(transfer.id) && <CheckCircle2 size={14} className="text-white" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <Plane size={16} className="text-blue-500" />
                                                        {transfer.destination}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">Flight {transfer.flight} • AWB: {transfer.awb}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                            {(transfer.weight).toLocaleString()} kg • {transfer.skids} Skids
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1
                                                            ${transfer.urgency === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {transfer.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Fleet Supply */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Fleet Supply
                                <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-300">
                                    {filteredFleet.length}
                                </span>
                            </h2>
                        </div>

                        <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                            {filteredFleet.map(truck => (
                                <div
                                    key={truck.id}
                                    onClick={() => truck.status === 'Available' && setSelectedTruck(truck.id)}
                                    className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-2 transition-all group
                                        ${selectedTruck === truck.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-transparent'}
                                        ${truck.status === 'Available' ? 'cursor-pointer hover:border-gray-200' : 'opacity-60 cursor-not-allowed grayscale'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                                <Truck size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">{truck.driver}</h3>
                                                <p className="text-xs text-gray-500">{truck.truck} • {truck.type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded font-medium
                                                ${truck.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {truck.status}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Cap: {(truck.capacity).toLocaleString()} kg
                                            </p>
                                        </div>
                                    </div>
                                    {truck.status === 'On Trip' && (
                                        <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-1/2"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Bottom Section: Legend (1/4) + Map (3/4) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 shrink-0 mt-6">

                    {/* Legend card */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <MapIcon size={15} className="text-blue-500 flex-shrink-0" />
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Route Status</h3>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Colour indicates collection urgency. Size represents harvest weight.
                            </p>
                        </div>

                        {/* Status colour key */}
                        <div className="space-y-3">
                            {[
                                { color: '#22c55e', label: 'Harvest Ready', sub: 'Collected within 24h' },
                                { color: '#f59e0b', label: 'En Route', sub: 'Driver dispatched' },
                                { color: '#ef4444', label: 'Pickup Delayed', sub: 'Overdue collection' },
                                { color: '#2563eb', label: 'Main Packhouse', sub: 'Kigali HQ' },
                            ].map(({ color, label, sub }) => (
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

                        <div className="border-t border-gray-100 dark:border-gray-700" />

                        {/* Size key */}
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Circle = Harvest Weight</p>
                            <div className="flex items-end gap-5">
                                {[{ r: 10, label: '500 kg' }, { r: 18, label: '2,500 kg' }, { r: 26, label: '5,000 kg' }].map(({ r, label }) => (
                                    <div key={label} className="flex flex-col items-center gap-1.5">
                                        <span className="block rounded-full" style={{
                                            width: r * 2, height: r * 2,
                                            background: '#22c55e',
                                            border: '2px solid white',
                                            boxShadow: '0 0 0 1.5px #22c55e88',
                                            opacity: 0.85,
                                        }} />
                                        <span className="text-[10px] text-gray-400 text-center leading-tight">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-0.5">Active Zones</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{HARVEST_DEMAND.length}</p>
                        </div>
                    </div>

                    {/* Map card */}
                    <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                            <div className="flex items-start gap-2">
                                <MapIcon size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h2 className="text-[17px] font-bold text-gray-900 dark:text-white">
                                        Active Collection Zones &amp; Routes
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-lg">
                                        Click on any marker to view specific farm and driver details.
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0 ml-4 mt-0.5">
                                Live View
                            </span>
                        </div>
                        <div className="flex-1 min-h-0 min-h-[420px]">
                            <RoutePreviewMap
                                selectedFarms={selectedFarms}
                                selectedTruck={selectedTruck}
                                allFarms={dispatchMode === 'farm' ? filteredDemand : filteredTransfers}
                                allTrucks={filteredFleet}
                            />
                        </div>
                    </div>

                </div>



            </div>

            {/* Floating Dispatch Footer */}
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 transition-all duration-300 transform z-[1000]
                ${(selectedFarms.length > 0 || selectedTruck) ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <div className="bg-gray-900 text-white rounded-2xl shadow-xl border border-gray-700 p-4 flex items-center justify-between">

                    <button
                        onClick={handleDiscard}
                        className="text-red-400 hover:text-red-300 font-bold px-4 py-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 mr-4"
                    >
                        <X size={18} />
                        Discard
                    </button>

                    <div className="flex flex-col flex-1 border-l border-gray-700 pl-6 border-r pr-6 mr-4 justify-center">
                        <span className="text-sm font-medium text-gray-300">
                            {dispatchMode === 'farm' ? (
                                <>Planning Trip: <span className="text-white font-bold">{selectedTruckData?.driver || 'Assign Truck...'}</span></>
                            ) : (
                                <>Planning Airport Transfer: <span className="text-white font-bold">{selectedTruckData?.driver || 'Assign Truck...'}</span></>
                            )}
                            <span className="mx-2 text-gray-600">•</span>
                            {dispatchMode === 'farm' ? (
                                <span>{selectedFarms.length} Pickups</span>
                            ) : (
                                <span>{selectedFarms.length > 0 ? (AIRPORT_TRANSFERS.find(a => a.id === selectedFarms[0])?.flight || selectedFarms.length + ' Shipments') : '0 Shipments'}</span>
                            )}
                            <span className="mx-2 text-gray-600">•</span>
                            <span className={`${isOverweight ? 'text-red-400' : 'text-blue-400'} font-bold`}>
                                Est. Load: {totalWeight.toLocaleString()} kg
                            </span>
                        </span>
                        {isOverweight && (
                            <span className="text-xs text-red-400 flex items-center gap-1 mt-1">
                                <AlertTriangle size={12} />
                                Exceeds Truck Capacity ({(selectedTruckData?.capacity || 0).toLocaleString()} kg)
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleDispatch}
                        disabled={!canDispatch || dispatched}
                        className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2
                            ${!canDispatch ? 'bg-gray-700 text-gray-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50'}`}
                    >
                        {dispatched ? 'Sending...' : '🚀 Dispatch & Send Link'}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Collections;
