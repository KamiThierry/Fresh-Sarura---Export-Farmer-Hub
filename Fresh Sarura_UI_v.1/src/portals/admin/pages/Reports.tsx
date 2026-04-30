import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { api } from '@/lib/api';

const Reports = () => {
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(); d.setMonth(d.getMonth() - 3);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [stock, setStock] = useState<any[]>([]);
    const [shipments, setShipments] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [farmers, setFarmers] = useState<any[]>([]);
    const [cycles, setCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [stockRes, shipmentsRes, usersRes, farmersRes, cyclesRes] = await Promise.all([
                    api.get('/stock'),
                    api.get('/shipments'),
                    api.get('/auth/users'),
                    api.get('/farmers'),
                    api.get('/crop-cycles'),
                ]);
                setStock(stockRes.data?.data       ?? stockRes?.data       ?? []);
                setShipments(shipmentsRes.data?.data ?? shipmentsRes?.data ?? []);
                setUsers(usersRes.data?.data        ?? usersRes?.data       ?? []);
                setFarmers(farmersRes.farmers       ?? farmersRes.data?.farmers ?? farmersRes.data ?? []);
                setCycles(cyclesRes.data?.data      ?? cyclesRes?.data      ?? []);
            } catch (err) {
                console.error('Failed to fetch report data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const inRange = (dateStr: string) => {
        const d = new Date(dateStr);
        return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59');
    };

    const filteredStock     = useMemo(() => stock.filter(b => inRange(b.updatedAt)),    [stock, startDate, endDate]);
    const filteredShipments = useMemo(() => shipments.filter(s => inRange(s.createdAt)), [shipments, startDate, endDate]);
    const filteredCycles    = useMemo(() => cycles.filter(c => inRange(c.createdAt)),   [cycles, startDate, endDate]);

    const totalReceived  = filteredStock.reduce((s, b) => s + (b.receivedWeightKg  || 0), 0);
    const totalProcessed = filteredStock.reduce((s, b) => s + (b.processedWeightKg || 0), 0);
    const totalRejected  = filteredStock.reduce((s, b) => s + (b.rejectedWeightKg  || 0), 0);
    const lossRate = totalReceived > 0 ? ((totalRejected / totalReceived) * 100).toFixed(1) : '0';
    const dispatched     = filteredShipments.filter(s => s.status === 'Dispatched');
    const totalExportedKg = dispatched.reduce((s, sh) => s + (sh.totalWeightKg || 0), 0);

    const monthlyStockData = useMemo(() => {
        const map: Record<string, { month: string; received: number; processed: number; rejected: number }> = {};
        filteredStock.forEach(b => {
            const month = new Date(b.updatedAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            if (!map[month]) map[month] = { month, received: 0, processed: 0, rejected: 0 };
            map[month].received  += b.receivedWeightKg  || 0;
            map[month].processed += b.processedWeightKg || 0;
            map[month].rejected  += b.rejectedWeightKg  || 0;
        });
        return Object.values(map).slice(-6);
    }, [filteredStock]);

    const monthlyShipmentData = useMemo(() => {
        const map: Record<string, { month: string; shipments: number; weightTons: number }> = {};
        filteredShipments.forEach(s => {
            const month = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            if (!map[month]) map[month] = { month, shipments: 0, weightTons: 0 };
            map[month].shipments  += 1;
            map[month].weightTons += parseFloat(((s.totalWeightKg || 0) / 1000).toFixed(2));
        });
        return Object.values(map).slice(-6);
    }, [filteredShipments]);

    const roleData = useMemo(() => {
        const map: Record<string, number> = {};
        users.forEach(u => { map[u.role] = (map[u.role] || 0) + 1; });
        return Object.entries(map).map(([role, count]) => ({ role: role.replace('_', ' '), count }));
    }, [users]);

    const handleDownload = () => {
        const rows = [
            ['FRESH SARURA — SYSTEM REPORT'],
            [`Period: ${startDate} to ${endDate}`],
            [''],
            ['PACKHOUSE SUMMARY'],
            ['Total Received (kg)', totalReceived],
            ['Total Processed (kg)', totalProcessed],
            ['Total Rejected (kg)', totalRejected],
            ['Loss Rate (%)', lossRate],
            [''],
            ['EXPORT SUMMARY'],
            ['Dispatched Shipments', dispatched.length],
            ['Total Exported (kg)', totalExportedKg],
            [''],
            ['PLATFORM SUMMARY'],
            ['Total Users', users.length],
            ['Total Farmers', farmers.length],
            ['Crop Cycles in Period', filteredCycles.length],
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `FreshSarura_Report_${startDate}_to_${endDate}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    const kpis = [
        { label: 'Total Received',        value: `${(totalReceived / 1000).toFixed(1)} Tons`,  color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Total Processed',       value: `${(totalProcessed / 1000).toFixed(1)} Tons`, color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Loss Rate',             value: `${lossRate}%`,                                color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/20' },
        { label: 'Exported (Dispatched)', value: `${(totalExportedKg / 1000).toFixed(1)} Tons`,color: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { label: 'Shipments',             value: String(dispatched.length),                     color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Active Farmers',        value: String(farmers.length),                        color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Crop Cycles',           value: String(filteredCycles.length),                 color: 'text-teal-600',    bg: 'bg-teal-50 dark:bg-teal-900/20' },
        { label: 'Total Users',           value: String(users.length),                          color: 'text-gray-600',    bg: 'bg-gray-50 dark:bg-gray-700/50' },
    ];

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600"><BarChart3 size={22} /></div>
                    <div>
                        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">System-wide operational metrics across all portals</p>
                    </div>
                </div>
                <button onClick={handleDownload}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                    <Download size={16} /> Download CSV
                </button>
            </div>

            {/* Date Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex items-center gap-4 flex-wrap">
                <Calendar size={18} className="text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Period:</span>
                <div className="flex items-center gap-3 flex-wrap">
                    {[{ label: 'From', val: startDate, set: setStartDate }, { label: 'To', val: endDate, set: setEndDate }].map(({ label, val, set }) => (
                        <div key={label}>
                            <label className="text-xs text-gray-400 block mb-1">{label}</label>
                            <input type="date" value={val} onChange={e => set(e.target.value)}
                                className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white" />
                        </div>
                    ))}
                </div>
                {loading && <span className="text-xs text-gray-400 ml-auto">Loading data...</span>}
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                    <div key={i} className={`${k.bg} rounded-xl p-4`}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{k.label}</p>
                        <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Packhouse — Received vs Processed vs Rejected (kg)</h2>
                    {monthlyStockData.length === 0 ? (
                        <p className="text-sm text-gray-400 py-8 text-center">No packhouse data in this period.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={monthlyStockData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="received"  fill="#3b82f6" radius={[4, 4, 0, 0]} name="Received" />
                                <Bar dataKey="processed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Processed" />
                                <Bar dataKey="rejected"  fill="#ef4444" radius={[4, 4, 0, 0]} name="Rejected" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Export Shipments — Volume (Tons)</h2>
                    {monthlyShipmentData.length === 0 ? (
                        <p className="text-sm text-gray-400 py-8 text-center">No shipment data in this period.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={monthlyShipmentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Line type="monotone" dataKey="weightTons" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Weight (Tons)" />
                                <Line type="monotone" dataKey="shipments"  stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Shipments Count" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Shipments in Period</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/40">
                                    {['PL Number', 'Destination', 'Weight (kg)', 'Status', 'Date'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {filteredShipments.length === 0 ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">No shipments in this period.</td></tr>
                                ) : filteredShipments.slice(0, 6).map(s => (
                                    <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{s.plNumber || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.destination || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.totalWeightKg?.toLocaleString() || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.status === 'Dispatched' ? 'bg-green-100 text-green-700' : s.status === 'PackingListGenerated' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString('en-GB')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">User Distribution by Role</h2>
                    </div>
                    <div className="p-5">
                        {roleData.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No user data.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={roleData} layout="vertical" barSize={16}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                    <YAxis type="category" dataKey="role" tick={{ fontSize: 11, fill: '#6b7280' }} width={120} />
                                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                                    <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} name="Users" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
