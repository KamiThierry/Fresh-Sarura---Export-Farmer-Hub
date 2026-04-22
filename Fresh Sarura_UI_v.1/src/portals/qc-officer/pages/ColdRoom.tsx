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
            // Backend returns { status: 'success', results: X, data: [...] }
            // api.get returns the body direktly.
            const data = (res.data || []).map((b: any) => ({
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Batches', value: stock.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Total Net Stock', value: `${Math.round(totalWeight).toLocaleString()} kg`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Inventory Density', value: 'High', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Loss / Rejections', value: `${Math.round(stock.reduce((a, b) => a + b.rejected, 0)).toLocaleString()} kg`, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                                    {stat.value}
                                </div>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                        </div>
                    </div>
                ))}
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
