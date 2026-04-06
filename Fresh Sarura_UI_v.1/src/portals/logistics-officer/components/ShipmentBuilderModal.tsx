import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Filter, Calendar, User, Plane, Hash, Check, ChevronDown, Plus, Save, CheckCircle2, Eye } from 'lucide-react';
import ShipmentDetailsModal from './ShipmentDetailsModal';

interface ShipmentBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock Stock Data
const AVAILABLE_STOCK = [
    { id: '1', product: 'Avocados (Hass)', grade: 'Grade A', location: 'Cold Room A', available: 1200, unit: 'kg' },
    { id: '2', product: 'Avocados (Fuerte)', grade: 'Grade B', location: 'Cold Room A', available: 800, unit: 'kg' },
    { id: '3', product: 'Fine Beans', grade: 'Premium', location: 'Packhouse 1', available: 500, unit: 'kg' },
    { id: '4', product: 'Chili (Bird Eye)', grade: 'Standard', location: 'Packhouse 2', available: 300, unit: 'kg' },
    { id: '5', product: 'Mangoes (Apple)', grade: 'Grade A', location: 'Cold Room B', available: 2000, unit: 'kg' },
];

interface Client {
    id: string;
    name: string;
    airport: string;
    email: string;
}

const MOCK_CLIENTS: Client[] = [
    { id: '1', name: 'Tesco UK', airport: 'LHR', email: 'procurement@tesco.com' },
    { id: '2', name: 'Carrefour Dubai', airport: 'DXB', email: 'fresh@carrefour.ae' },
    { id: '3', name: 'Albert Heijn', airport: 'AMS', email: 'sourcing@ah.nl' },
];

const ClientCombobox = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
    const [isAdding, setIsAdding] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', airport: '', email: '' });
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsAdding(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredClients = query === ''
        ? clients
        : clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

    const handleAddClient = () => {
        if (!newClient.name) return;
        const entry: Client = { id: Date.now().toString(), ...newClient };
        setClients(prev => [...prev, entry]);
        onChange(entry.name);
        setIsAdding(false);
        setIsOpen(false);
        setNewClient({ name: '', airport: '', email: '' });
        setQuery('');
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <input
                    type="text"
                    className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    value={value}
                    readOnly
                    placeholder="Select Client..."
                />
                <User size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <ChevronDown size={16} className={`absolute right-3 top-2.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-100">
                    {!isAdding ? (
                        <>
                            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full pl-9 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Search clients..."
                                        autoFocus
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto p-1">
                                {filteredClients.map(client => (
                                    <div
                                        key={client.id}
                                        className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                                            ${value === client.name ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                                        onClick={() => { onChange(client.name); setIsOpen(false); }}
                                    >
                                        <span className="font-medium">{client.name}</span>
                                        {value === client.name && <Check size={14} />}
                                    </div>
                                ))}
                                {filteredClients.length === 0 && (
                                    <div className="px-3 py-4 text-center text-xs text-gray-500">No clients found.</div>
                                )}
                            </div>
                            <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <button
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-md text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors font-medium"
                                    onClick={(e) => { e.stopPropagation(); setIsAdding(true); }}
                                >
                                    <Plus size={14} />
                                    Add New Client
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">New Client Details</h4>
                                <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                            </div>
                            <div className="space-y-3">
                                <input className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Company Name" autoFocus value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} />
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Airport (e.g. LHR)" value={newClient.airport} onChange={e => setNewClient({ ...newClient, airport: e.target.value })} />
                                    <input className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} />
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-bold shadow-sm transition-colors" onClick={handleAddClient}>
                                    <Save size={14} /> Save Client
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
const ShipmentBuilderModal = ({ isOpen, onClose }: ShipmentBuilderModalProps) => {
    const [submitted, setSubmitted] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Reset success state every time the modal opens
    useEffect(() => {
        if (isOpen) setSubmitted(false);
    }, [isOpen]);

    // Form state
    const [client, setClient] = useState('');
    const [flightNo, setFlightNo] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [duration, setDuration] = useState('');
    const [invNumber, setInvNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [pallets, setPallets] = useState(0);

    // Flight auto-fill
    useMemo(() => {
        const f = flightNo.toUpperCase();
        if (f === 'WB300') setDuration('8h 30m');
        else if (f === 'ET800') setDuration('5h 15m');
    }, [flightNo]);

    // Selection state
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const [searchTerm, setSearchTerm] = useState('');

    const toggleSelection = (id: string) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(prev => prev.filter(i => i !== id));
        } else {
            setSelectedItems(prev => [...prev, id]);
            setQuantities(prev => ({ ...prev, [id]: 10 }));
        }
    };

    const handleQuantityChange = (id: string, val: string) => {
        setQuantities(prev => ({ ...prev, [id]: parseInt(val) || 0 }));
    };

    const filteredStock = AVAILABLE_STOCK.filter(item =>
        item.product.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSelected = selectedItems.length;
    const totalBoxes = selectedItems.reduce((sum, id) => sum + (quantities[id] || 0), 0);

    const totalWeight = useMemo(() => {
        let w = selectedItems.reduce((sum, id) => sum + (quantities[id] || 0) * 4, 0);
        w += pallets * 15;
        return w;
    }, [selectedItems, quantities, pallets]);

    if (!isOpen) return null;

    const MOCK_SHIPMENT = {
        id: 'PL-2024-001',
        client: client || 'MWW Experts',
        flight: flightNo || 'WB300',
        weight: totalWeight,
        boxes: totalBoxes,
        duration: duration || '8h 30m',
        commodities: selectedItems.map(id => AVAILABLE_STOCK.find(s => s.id === id)?.product || '').filter(Boolean),
    };

    return (
        <>
            {createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />

                    {/* Modal */}
                    <div className="relative w-full max-w-6xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col min-h-[85vh] max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-10 flex-shrink-0">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Packing List</h2>
                            <div className="flex items-center gap-3">
                                {!submitted && (
                                    <div className="hidden md:flex items-center gap-6 mr-6 text-sm">
                                        <div className="flex flex-col items-end">
                                            <span className="text-gray-500">Items Available</span>
                                            <span className="font-bold text-gray-900 dark:text-white text-lg leading-none">{filteredStock.length}</span>
                                        </div>
                                        <div className="flex flex-col items-end border-l pl-6 border-gray-200 dark:border-gray-700">
                                            <span className="text-gray-500">Currently Selected</span>
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg leading-none">{totalSelected}</span>
                                        </div>
                                    </div>
                                )}
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* ── SUCCESS STATE ── */}
                        {submitted ? (
                            <div className="flex flex-col flex-1">
                                {/* Centred icon + title — fills the form area */}
                                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">Packing List Generated!</p>
                                </div>

                                {/* Footer — same border-top pattern as the header */}
                                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center flex-shrink-0">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => setIsDetailsOpen(true)}
                                        className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors shadow-sm"
                                    >
                                        View Packing List Status
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Body - Split View */}
                                <div className="flex flex-1 overflow-hidden">

                                    {/* LEFT: Stock List */}
                                    <div className="w-7/12 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex gap-2">
                                            <div className="relative flex-1">
                                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search stock..."
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={searchTerm}
                                                    onChange={e => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <button className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-indigo-600">
                                                <Filter size={18} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-800/50">
                                            <div className="col-span-1" />
                                            <div className="col-span-5">Product</div>
                                            <div className="col-span-3">Availability</div>
                                            <div className="col-span-3 text-right">Qty (Boxes)</div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                            {filteredStock.map(item => {
                                                const isSelected = selectedItems.includes(item.id);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`grid grid-cols-12 gap-4 px-4 py-3 items-center rounded-lg transition-all cursor-pointer group
                                                            ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' : 'hover:bg-white dark:hover:bg-gray-800'}`}
                                                        onClick={() => toggleSelection(item.id)}
                                                    >
                                                        <div className="col-span-1 flex justify-center">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                                ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                                                                {isSelected && <Check size={12} className="text-white" />}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-5 flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                                                ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                                                                {item.product.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900 dark:text-white text-sm">{item.product}</div>
                                                                <div className="text-xs text-gray-500">{item.grade}</div>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-3">
                                                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                                                {item.available} {item.unit}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-3">
                                                            {isSelected && (
                                                                <div className="flex items-center justify-end" onClick={e => e.stopPropagation()}>
                                                                    <input
                                                                        type="number"
                                                                        className="w-20 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                        value={quantities[item.id] || ''}
                                                                        onChange={e => handleQuantityChange(item.id, e.target.value)}
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* RIGHT: Shipment Details */}
                                    <div className="w-5/12 p-6 flex flex-col bg-white dark:bg-gray-900">
                                        <div className="space-y-6 flex-1">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    <Plane size={16} className="text-indigo-600" />
                                                    Shipment Details
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="col-span-2 space-y-1.5">
                                                        <label className="text-xs font-medium text-gray-500">Client / Consignee</label>
                                                        <ClientCombobox value={client} onChange={setClient} />
                                                    </div>
                                                    <div className="col-span-2 grid grid-cols-3 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-medium text-gray-500">Departure Date</label>
                                                            <div className="relative">
                                                                <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                                                <input type="date" className="w-full pl-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" value={departureDate} onChange={e => setDepartureDate(e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Dep. Time</label>
                                                            <input type="time" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-lg text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" value={departureTime} onChange={e => setDepartureTime(e.target.value)} />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-medium text-gray-500">Est. Duration</label>
                                                            <input type="text" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 8h 30m" value={duration} onChange={e => setDuration(e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-gray-500">Flight No</label>
                                                        <input type="text" placeholder="WB300" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" value={flightNo} onChange={e => setFlightNo(e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-gray-500">PL Number</label>
                                                    <input type="text" value="PL-2024-001" readOnly className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-gray-500">Invoice #</label>
                                                    <div className="relative">
                                                        <Hash size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                                        <input type="text" className="w-full pl-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" value={invNumber} onChange={e => setInvNumber(e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col">
                                                <label className="text-xs font-medium text-gray-500 mb-1.5">Special Instructions / Notes</label>
                                                <textarea
                                                    className="flex-1 w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                                                    placeholder="Add notes for the logistics team..."
                                                    value={notes}
                                                    onChange={e => setNotes(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center z-10 flex-shrink-0">
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Total Boxes</span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">{totalBoxes}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Skids / Pallets</span>
                                            <input
                                                type="number" min="0"
                                                className="w-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-center font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                                placeholder="0"
                                                value={pallets || ''}
                                                onChange={e => setPallets(parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="text-right pl-6 border-l border-gray-200 dark:border-gray-800">
                                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Est. Gross Weight</span>
                                            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalWeight} kg</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={onClose}
                                            className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => setSubmitted(true)}
                                            disabled={totalBoxes === 0}
                                            className={`px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center gap-2
                                                ${totalBoxes === 0
                                                    ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                                        >
                                            Generate Packing List
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                </div>,
                document.body
            )}

            {/* Shipment Details opens on "View Packing List Status" */}
            <ShipmentDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => { setIsDetailsOpen(false); onClose(); }}
                shipment={MOCK_SHIPMENT}
            />
        </>
    );
};

export default ShipmentBuilderModal;
