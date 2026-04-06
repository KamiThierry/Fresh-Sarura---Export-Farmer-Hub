import { useState } from 'react';
import { Thermometer, Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface StockItem {
    id: string;
    crop: string;
    batchId: string;
    weight: string;
    temperature: string;
    entryDate: string;
    expiryDate: string;
    daysLeft: number;
    condition: 'Good' | 'Monitor' | 'Critical';
}

const stockItems: StockItem[] = [
    { id: 'CR-001', crop: 'French Beans', batchId: 'B-2026-041', weight: '580 kg', temperature: '4°C', entryDate: '08 Mar', expiryDate: '10 Mar', daysLeft: 2, condition: 'Monitor' },
    { id: 'CR-002', crop: 'Avocados (Hass)', batchId: 'B-2026-042', weight: '820 kg', temperature: '6°C', entryDate: '07 Mar', expiryDate: '12 Mar', daysLeft: 4, condition: 'Good' },
    { id: 'CR-003', crop: 'Snow Peas', batchId: 'B-2026-043', weight: '390 kg', temperature: '3°C', entryDate: '08 Mar', expiryDate: '09 Mar', daysLeft: 1, condition: 'Critical' },
    { id: 'CR-004', crop: 'Baby Courgettes', batchId: 'B-2026-044', weight: '295 kg', temperature: '5°C', entryDate: '06 Mar', expiryDate: '11 Mar', daysLeft: 3, condition: 'Good' },
    { id: 'CR-005', crop: 'Chillies (Red)', batchId: 'B-2026-045', weight: '175 kg', temperature: '8°C', entryDate: '05 Mar', expiryDate: '13 Mar', daysLeft: 5, condition: 'Good' },
];

const conditionStyles = {
    'Good': { badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', row: '', icon: CheckCircle, iconColor: 'text-green-500' },
    'Monitor': { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', row: 'bg-amber-50/40 dark:bg-amber-900/10', icon: Clock, iconColor: 'text-amber-500' },
    'Critical': { badge: 'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400', row: 'bg-red-50/40   dark:bg-red-900/10', icon: AlertTriangle, iconColor: 'text-red-500' },
};

const totalWeight = stockItems.reduce((acc, i) => acc + parseInt(i.weight), 0);

const ColdRoom = () => {
    const [search, setSearch] = useState('');
    const [filterCondition, setFilterCondition] = useState<'All' | 'Good' | 'Monitor' | 'Critical'>('All');

    const filtered = stockItems.filter(r => {
        const matchSearch = r.crop.toLowerCase().includes(search.toLowerCase()) ||
            r.batchId.toLowerCase().includes(search.toLowerCase()) ||
            r.id.toLowerCase().includes(search.toLowerCase());
        const matchCondition = filterCondition === 'All' || r.condition === filterCondition;
        return matchSearch && matchCondition;
    });

    const critical = stockItems.filter(i => i.condition === 'Critical').length;
    const monitor = stockItems.filter(i => i.condition === 'Monitor').length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cold Room (Stock)</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Monitor all batches currently in cold storage with temperature and expiry tracking.</p>
                </div>
            </div>

            {/* KPI Mini Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-theme shadow-sm flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><Thermometer size={22} className="text-blue-600" /></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Batches in Cold Room</p><p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stockItems.length}</p></div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-theme shadow-sm flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20"><Package size={22} className="text-green-600" /></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Stock Weight</p><p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{totalWeight.toLocaleString()} kg</p></div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-theme shadow-sm flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><Clock size={22} className="text-amber-600" /></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Needs Monitoring</p><p className="text-2xl font-bold text-amber-600 mt-0.5">{monitor}</p></div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-theme shadow-sm flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20"><AlertTriangle size={22} className="text-red-600" /></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Critical / Expiring</p><p className="text-2xl font-bold text-red-600 mt-0.5">{critical}</p></div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-theme shadow-sm p-4 flex flex-wrap items-center gap-3">
                <input
                    type="text"
                    placeholder="Search by Stock ID, Batch ID, or crop..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-theme text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex gap-2">
                    {(['All', 'Good', 'Monitor', 'Critical'] as const).map(c => (
                        <button
                            key={c}
                            onClick={() => setFilterCondition(c)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterCondition === c
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                }`}
                        >{c}</button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-theme shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                                {['Stock ID', 'Crop', 'Batch ID', 'Weight', 'Temp.', 'Entry Date', 'Expiry Date', 'Days Left', 'Condition'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={9} className="px-5 py-10 text-center text-gray-400 text-sm">No matching stock items found.</td></tr>
                            ) : filtered.map(row => {
                                const style = conditionStyles[row.condition];
                                const Icon = style.icon;
                                return (
                                    <tr key={row.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${style.row}`}>
                                        <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">{row.id}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{row.crop}</td>
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{row.batchId}</td>
                                        <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">{row.weight}</td>
                                        <td className="px-5 py-4 text-sm text-blue-600 dark:text-blue-400 font-semibold">{row.temperature}</td>
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{row.entryDate}</td>
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{row.expiryDate}</td>
                                        <td className="px-5 py-4">
                                            <span className={`text-sm font-bold ${row.daysLeft <= 1 ? 'text-red-600' : row.daysLeft <= 3 ? 'text-amber-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {row.daysLeft}d
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
                                                <Icon size={11} /> {row.condition}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ColdRoom;
