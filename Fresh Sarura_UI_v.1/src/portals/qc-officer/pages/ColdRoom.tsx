import { useState, useEffect } from 'react';
import { Thermometer, Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../../lib/api';

interface StockItem {
    id: string;
    crop: string;
    batchId: string;
    received: number;
    processed: number;
    rejected: number;
    netStock: number;
    entryDate: string;
    status: string;
}

const ColdRoom = () => {
    const [stock, setStock] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchStock = async () => {
        setLoading(true);
        try {
            const res = await api.get('/stock');
            const data = (res.data.data || []).map((b: any) => ({
                id: b._id,
                crop: b.cropName,
                batchId: b._id,
                received: b.receivedWeightKg,
                processed: b.processedWeightKg,
                rejected: b.rejectedWeightKg,
                netStock: (b.processedWeightKg || 0) - (b.rejectedWeightKg || 0),
                entryDate: new Date(b.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                status: b.status
            }));
            setStock(data);
        } catch (err) {
            console.error('Failed to fetch stock:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStock();
    }, []);

    const filtered = stock.filter(r => 
        r.crop.toLowerCase().includes(search.toLowerCase()) ||
        r.batchId.toLowerCase().includes(search.toLowerCase())
    );

    const totalWeight = stock.reduce((acc, i) => acc + i.netStock, 0);

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
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><Package size={22} className="text-blue-600" /></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Batches</p><p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stock.length}</p></div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-theme shadow-sm flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20"><CheckCircle size={22} className="text-green-600" /></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Net Stock</p><p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{Math.round(totalWeight).toLocaleString()} kg</p></div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-theme shadow-sm flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><Clock size={22} className="text-amber-600" /></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Inventory Density</p><p className="text-2xl font-bold text-amber-600 mt-0.5">High</p></div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-theme shadow-sm flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20"><AlertTriangle size={22} className="text-red-600" /></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Loss / Rejections</p><p className="text-2xl font-bold text-red-600 mt-0.5">{Math.round(stock.reduce((a, b) => a + b.rejected, 0)).toLocaleString()} kg</p></div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-theme shadow-sm p-4 flex flex-wrap items-center gap-3">
                <input
                    type="text"
                    placeholder="Search by Batch ID or crop..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-theme text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-theme shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                                {['Batch ID', 'Crop', 'Received (kg)', 'Processed (kg)', 'Rejected (kg)', 'Net Stock (kg)', 'Entry Date', 'Status'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">Loading stock data...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">No stock items found.</td></tr>
                            ) : filtered.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white font-mono">{row.id.slice(-8).toUpperCase()}</td>
                                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{row.crop}</td>
                                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{row.received.toLocaleString()}</td>
                                    <td className="px-5 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">{row.processed.toLocaleString()}</td>
                                    <td className="px-5 py-4 text-sm font-medium text-red-500 dark:text-red-400">{row.rejected.toLocaleString()}</td>
                                    <td className="px-5 py-4 text-sm font-bold text-green-600 dark:text-green-400">{row.netStock.toLocaleString()}</td>
                                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{row.entryDate}</td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default ColdRoom;
