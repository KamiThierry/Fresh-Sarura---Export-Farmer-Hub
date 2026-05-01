import { useState, useEffect, useMemo } from 'react';
import {
    BarChart3, Download, Calendar, Users,
    Package, Plane, Leaf, TrendingUp, TrendingDown,
    Minus, Thermometer
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────
type Tab = 'overview' | 'farmers' | 'production' | 'export' | 'users';

// ─── Pagination ───────────────────────────────────────────────────
const Pagination = ({ total, page, perPage, onChange }: {
    total: number; page: number; perPage: number; onChange: (p: number) => void;
}) => {
    const totalPages = Math.ceil(total / perPage);
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-400">
                Showing {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} of {total}
            </span>
            <div className="flex gap-1">
                <button onClick={() => onChange(page - 1)} disabled={page === 1}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                        if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                        acc.push(p); return acc;
                    }, [])
                    .map((p, i) => p === '...'
                        ? <span key={`e-${i}`} className="px-2 py-1.5 text-xs text-gray-400">…</span>
                        : <button key={p} onClick={() => onChange(p as number)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${page === p ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                            {p}
                          </button>
                    )}
                <button onClick={() => onChange(page + 1)} disabled={page === Math.ceil(total / perPage)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Next →
                </button>
            </div>
        </div>
    );
};

// ─── Badge ────────────────────────────────────────────────────────
const Badge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        Dispatched:           'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        PackingListGenerated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        Draft:                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
        Done:                 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        Processing:           'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        RoomRequested:        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        Active:               'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        active:               'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        harvesting:           'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse',
        completed:            'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
        Inactive:             'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        Auditing:             'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return (
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : ''}
        </span>
    );
};

// ─── Table Shell ──────────────────────────────────────────────────
const TableShell = ({ title, headers, children, total, page, perPage, onPage }: {
    title: string; headers: string[]; children: React.ReactNode;
    total: number; page: number; perPage: number; onPage: (p: number) => void;
}) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/40">
                        {headers.map(h => (
                            <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">{children}</tbody>
            </table>
        </div>
        <Pagination total={total} page={page} perPage={perPage} onChange={onPage} />
    </div>
);

// ─── KPI Card (image 2 style) ─────────────────────────────────────
const KpiCard = ({ label, value, icon: Icon, iconBg, trend, trendLabel }: {
    label: string;
    value: string;
    icon: React.ElementType;
    iconBg: string;
    trend?: 'up' | 'down' | 'neutral';
    trendLabel?: string;
}) => {
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                <div className={`p-2 rounded-xl ${iconBg}`}>
                    <Icon size={18} className="opacity-80" />
                </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
            {trendLabel && (
                <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                    <TrendIcon size={13} />
                    <span>{trendLabel}</span>
                </div>
            )}
        </div>
    );
};

// ─── Empty Row ────────────────────────────────────────────────────
const EmptyRow = ({ cols, msg = 'No data in this period.' }: { cols: number; msg?: string }) => (
    <tr><td colSpan={cols} className="py-10 text-center text-gray-400 text-sm">{msg}</td></tr>
);

const PER_PAGE = 8;

// ═══════════════════════════════════════════════════════════════════
const Reports = () => {
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(); d.setMonth(d.getMonth() - 3);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate]       = useState(() => new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab]   = useState<Tab>('overview');
    const [farmerPage,     setFarmerPage]     = useState(1);
    const [cyclePage,      setCyclePage]      = useState(1);
    const [productionPage, setProductionPage] = useState(1);
    const [shipmentPage,   setShipmentPage]   = useState(1);
    const [userPage,       setUserPage]       = useState(1);
    const [stock,     setStock]     = useState<any[]>([]);
    const [shipments, setShipments] = useState<any[]>([]);
    const [users,     setUsers]     = useState<any[]>([]);
    const [farmers,   setFarmers]   = useState<any[]>([]);
    const [cycles,    setCycles]    = useState<any[]>([]);
    const [loading,   setLoading]   = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const q = `?startDate=${startDate}&endDate=${endDate}`;
                const [stockRes, shipmentsRes, usersRes, farmersRes, cyclesRes] = await Promise.all([
                    api.get(`/stock${q}`), api.get(`/shipments${q}`), api.get(`/auth/users${q}`),
                    api.get(`/farmers${q}`), api.get(`/crop-cycles${q}`),
                ]);
                setStock(stockRes.data?.data         ?? stockRes?.data         ?? []);
                setShipments(shipmentsRes.data?.data ?? shipmentsRes?.data     ?? []);
                setUsers(usersRes.data?.data          ?? usersRes?.data        ?? []);
                setFarmers(farmersRes.farmers         ?? farmersRes.data?.farmers ?? farmersRes.data ?? []);
                setCycles(cyclesRes.data?.data        ?? cyclesRes?.data       ?? []);
            } catch (err) {
                console.error('Failed to fetch report data', err);
            } finally { setLoading(false); }
        };
        fetchAll();
    }, [startDate, endDate]);

    const inRange = (dateStr: string) => {
        const d = new Date(dateStr);
        return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59');
    };

    const filteredStock     = useMemo(() => stock.filter(b     => inRange(b.updatedAt)),   [stock,     startDate, endDate]);
    const filteredShipments = useMemo(() => shipments.filter(s => inRange(s.createdAt)),   [shipments, startDate, endDate]);
    const filteredCycles    = useMemo(() => cycles.filter(c    => inRange(c.createdAt)),   [cycles,    startDate, endDate]);

    const totalReceived   = filteredStock.reduce((s, b) => s + (b.receivedWeightKg  || 0), 0);
    const totalProcessed  = filteredStock.reduce((s, b) => s + (b.processedWeightKg || 0), 0);
    const totalRejected   = filteredStock.reduce((s, b) => s + (b.rejectedWeightKg  || 0), 0);
    const coldRoomStockKg = filteredStock.reduce((s, b) => s + ((b.processedWeightKg || 0) - (b.rejectedWeightKg || 0)), 0);
    const lossRate        = totalReceived > 0 ? ((totalRejected / totalReceived) * 100).toFixed(1) : '0';
    const dispatched      = filteredShipments.filter(s => s.status === 'Dispatched');
    const totalExportedKg = dispatched.reduce((s, sh) => s + (sh.totalWeightKg || 0), 0);

    const monthlyStockData = useMemo(() => {
        const map: Record<string, any> = {};
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
        const map: Record<string, any> = {};
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
        return Object.entries(map).map(([role, count]) => ({ role: role.replace(/_/g, ' '), count }));
    }, [users]);

    const pagedFarmers    = farmers.slice((farmerPage - 1)     * PER_PAGE, farmerPage     * PER_PAGE);
    const pagedCycles     = filteredCycles.slice((cyclePage - 1) * PER_PAGE, cyclePage    * PER_PAGE);
    const pagedProduction = filteredStock.slice((productionPage - 1) * PER_PAGE, productionPage * PER_PAGE);
    const pagedShipments  = filteredShipments.slice((shipmentPage - 1) * PER_PAGE, shipmentPage * PER_PAGE);
    const pagedUsers      = users.slice((userPage - 1) * PER_PAGE, userPage * PER_PAGE);

    const handleDownload = () => {
        const rows = [
            ['FRESH SARURA — SYSTEM REPORT'], [`Period: ${startDate} to ${endDate}`], [''],
            ['PACKHOUSE SUMMARY'],
            ['Total Received (kg)', totalReceived], ['Total Processed (kg)', totalProcessed],
            ['Total Rejected (kg)', totalRejected], ['Loss Rate (%)', lossRate], [''],
            ['EXPORT SUMMARY'],
            ['Dispatched Shipments', dispatched.length], ['Total Exported (kg)', totalExportedKg], [''],
            ['PLATFORM SUMMARY'],
            ['Total Users', users.length], ['Total Farmers', farmers.length],
            ['Crop Cycles in Period', filteredCycles.length],
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `FreshSarura_Report_${startDate}_to_${endDate}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'overview',   label: 'Overview',        icon: BarChart3 },
        { id: 'farmers',    label: 'Farmers & Crops', icon: Leaf      },
        { id: 'production', label: 'Production & QC', icon: Package   },
        { id: 'export',     label: 'Export',          icon: Plane     },
        { id: 'users',      label: 'User Activity',   icon: Users     },
    ];

    // ── Shared chart styles ──
    const chartCard = "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5";

    return (
        <div className="p-6 space-y-6 animate-fade-in">

            {/* ── Header Row (image 2 style: title left, controls right) ── */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Business health monitor and strategic insights
                    </p>
                </div>

                {/* Date range + button — all in one row like image 2 */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 shadow-sm">
                        <Calendar size={15} className="text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-400 font-medium">From:</span>
                        <input
                            type="date" value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="text-sm text-gray-700 dark:text-white bg-transparent border-none outline-none cursor-pointer"
                        />
                        <span className="text-xs text-gray-400 font-medium ml-2">To:</span>
                        <input
                            type="date" value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="text-sm text-gray-700 dark:text-white bg-transparent border-none outline-none cursor-pointer"
                        />
                    </div>
                    {loading && (
                        <span className="text-xs text-gray-400 animate-pulse">Loading…</span>
                    )}
                    <button onClick={handleDownload}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                        <Download size={15} /> Export Data
                    </button>
                </div>
            </div>

            {/* ── Tab Navigation (underline style like image 2) ── */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-0 overflow-x-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                    active
                                        ? 'border-green-600 text-green-700 dark:text-green-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
                                }`}>
                                <Icon size={15} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                TAB 1 — OVERVIEW
            ══════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard label="Total Received"   value={`${(totalReceived / 1000).toFixed(1)} Tons`}    icon={Package}  iconBg="bg-blue-50 dark:bg-blue-900/20 text-blue-600"    trend="up"      trendLabel="+5% vs last period" />
                        <KpiCard label="Total Processed"  value={`${(totalProcessed / 1000).toFixed(1)} Tons`}  icon={BarChart3} iconBg="bg-green-50 dark:bg-green-900/20 text-green-600"  trend="up"      trendLabel="+3% vs last period" />
                        <KpiCard label="Loss Rate"        value={`${lossRate}%`}                                 icon={TrendingDown} iconBg="bg-red-50 dark:bg-red-900/20 text-red-500"   trend={parseFloat(lossRate) > 10 ? 'down' : 'up'} trendLabel={parseFloat(lossRate) > 10 ? 'Needs attention' : 'Within target'} />
                        <KpiCard label="Total Exported"   value={`${(totalExportedKg / 1000).toFixed(1)} Tons`} icon={Plane}    iconBg="bg-purple-50 dark:bg-purple-900/20 text-purple-600" trend="up"      trendLabel={`${dispatched.length} dispatched`} />
                        <KpiCard label="Shipments"        value={String(filteredShipments.length)}               icon={Plane}    iconBg="bg-amber-50 dark:bg-amber-900/20 text-amber-600"   trend="neutral" trendLabel="In selected period" />
                        <KpiCard label="Registered Farmers" value={String(farmers.length)}                       icon={Leaf}     iconBg="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" trend="neutral" trendLabel="Total on platform" />
                        <KpiCard label="Crop Cycles"      value={String(filteredCycles.length)}                  icon={Leaf}     iconBg="bg-teal-50 dark:bg-teal-900/20 text-teal-600"      trend="neutral" trendLabel="In selected period" />
                        <KpiCard label="Total Users"      value={String(users.length)}                           icon={Users}    iconBg="bg-gray-100 dark:bg-gray-700 text-gray-500"         trend="neutral" trendLabel="System accounts" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={chartCard}>
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Packhouse Activity</h2>
                            <p className="text-xs text-gray-400 mb-4">Received vs Processed vs Rejected (kg)</p>
                            {monthlyStockData.length === 0
                                ? <p className="text-sm text-gray-400 py-8 text-center">No packhouse data in this period.</p>
                                : <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={monthlyStockData} barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                                        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Bar dataKey="received"  fill="#3b82f6" radius={[4,4,0,0]} name="Received" />
                                        <Bar dataKey="processed" fill="#22c55e" radius={[4,4,0,0]} name="Processed" />
                                        <Bar dataKey="rejected"  fill="#ef4444" radius={[4,4,0,0]} name="Rejected" />
                                    </BarChart>
                                </ResponsiveContainer>
                            }
                        </div>
                        <div className={chartCard}>
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Export Shipments</h2>
                            <p className="text-xs text-gray-400 mb-4">Volume in Tons over time</p>
                            {monthlyShipmentData.length === 0
                                ? <p className="text-sm text-gray-400 py-8 text-center">No shipment data in this period.</p>
                                : <ResponsiveContainer width="100%" height={240}>
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
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                TAB 2 — FARMERS & CROPS
            ══════════════════════════════════════════════════════ */}
            {activeTab === 'farmers' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard label="Total Farmers"    value={String(farmers.length)}  icon={Leaf}  iconBg="bg-green-50 dark:bg-green-900/20 text-green-600"   trend="neutral" trendLabel="Registered on platform" />
                        <KpiCard label="Active Farmers"   value={String(farmers.filter(f => f.status === 'Active').length)} icon={Leaf} iconBg="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" trend="up" trendLabel="Currently active" />
                        <KpiCard label="Crop Cycles"      value={String(filteredCycles.length)} icon={BarChart3} iconBg="bg-teal-50 dark:bg-teal-900/20 text-teal-600" trend="neutral" trendLabel="In selected period" />
                        <KpiCard label="Avg Farm Size"    value={farmers.length ? `${(farmers.reduce((s, f) => s + (f.farm_size_hectares || 0), 0) / farmers.length).toFixed(1)} ha` : '—'} icon={Package} iconBg="bg-blue-50 dark:bg-blue-900/20 text-blue-600" trend="neutral" trendLabel="Per registered farmer" />
                    </div>
                    <TableShell title="Registered Farmers"
                        headers={['Full Name', 'Farm Name', 'Province', 'District', 'Produce', 'Farm Size (ha)', 'Status', 'Registered']}
                        total={farmers.length} page={farmerPage} perPage={PER_PAGE} onPage={setFarmerPage}>
                        {pagedFarmers.length === 0 ? <EmptyRow cols={8} msg="No farmers registered." /> :
                            pagedFarmers.map(f => (
                                <tr key={f._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{f.full_name}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{f.farm_name || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{f.province || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{f.district}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[140px] truncate">{(f.produce_types || []).join(', ')}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{f.farm_size_hectares}</td>
                                    <td className="px-4 py-3"><Badge status={f.status} /></td>
                                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(f.createdAt).toLocaleDateString('en-GB')}</td>
                                </tr>
                            ))}
                    </TableShell>
                    <TableShell title="Crop Cycles in Period"
                        headers={['Cycle ID', 'Crop', 'Season', 'Status', 'Started']}
                        total={filteredCycles.length} page={cyclePage} perPage={PER_PAGE} onPage={setCyclePage}>
                        {pagedCycles.length === 0 ? <EmptyRow cols={5} /> :
                            pagedCycles.map(c => (
                                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{c.cycleId || String(c._id).slice(-8).toUpperCase()}</td>
                                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{c.crop_name || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.season || '—'}</td>
                                    <td className="px-4 py-3"><Badge status={c.status || 'Active'} /></td>
                                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString('en-GB')}</td>
                                </tr>
                            ))}
                    </TableShell>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                TAB 3 — PRODUCTION & QC
            ══════════════════════════════════════════════════════ */}
            {activeTab === 'production' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard label="Cold Room Stock" value={`${(coldRoomStockKg / 1000).toFixed(1)} Tons`} icon={Thermometer} iconBg="bg-blue-50 dark:bg-blue-900/20 text-blue-600" trend="neutral" trendLabel="Processed in period" />
                        <KpiCard label="Total Processed" value={`${totalProcessed.toLocaleString()} kg`} icon={BarChart3}    iconBg="bg-green-50 dark:bg-green-900/20 text-green-600" trend="neutral" trendLabel="After processing" />
                        <KpiCard label="Total Rejected"  value={`${totalRejected.toLocaleString()} kg`}  icon={TrendingDown} iconBg="bg-red-50 dark:bg-red-900/20 text-red-500"     trend="down"    trendLabel="Failed QC" />
                        <KpiCard label="Loss Rate"       value={`${lossRate}%`}                          icon={TrendingDown} iconBg="bg-amber-50 dark:bg-amber-900/20 text-amber-600" trend={parseFloat(lossRate) > 10 ? 'down' : 'up'} trendLabel={parseFloat(lossRate) > 10 ? 'Above threshold' : 'Within target'} />
                    </div>
                    <div className={chartCard}>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Monthly Packhouse Activity</h2>
                        <p className="text-xs text-gray-400 mb-4">Received vs Processed vs Rejected (kg)</p>
                        {monthlyStockData.length === 0
                            ? <p className="text-sm text-gray-400 py-8 text-center">No data in this period.</p>
                            : <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={monthlyStockData} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Bar dataKey="received"  fill="#3b82f6" radius={[4,4,0,0]} name="Received" />
                                    <Bar dataKey="processed" fill="#22c55e" radius={[4,4,0,0]} name="Processed" />
                                    <Bar dataKey="rejected"  fill="#ef4444" radius={[4,4,0,0]} name="Rejected" />
                                </BarChart>
                            </ResponsiveContainer>
                        }
                    </div>
                    <TableShell title="Processing Batches"
                        headers={['Stock ID', 'Crop', 'Received (kg)', 'Processed (kg)', 'Rejected (kg)', 'Loss %', 'Status', 'Date']}
                        total={filteredStock.length} page={productionPage} perPage={PER_PAGE} onPage={setProductionPage}>
                        {pagedProduction.length === 0 ? <EmptyRow cols={8} /> :
                            pagedProduction.map(b => {
                                const loss = b.receivedWeightKg > 0 ? ((b.rejectedWeightKg / b.receivedWeightKg) * 100).toFixed(1) : '0';
                                return (
                                    <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{b.stockId || '—'}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{b.cropName || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{(b.receivedWeightKg || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{(b.processedWeightKg || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{(b.rejectedWeightKg || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3"><span className={`text-xs font-bold ${parseFloat(loss) > 15 ? 'text-red-600' : 'text-green-600'}`}>{loss}%</span></td>
                                        <td className="px-4 py-3"><Badge status={b.status} /></td>
                                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(b.updatedAt).toLocaleDateString('en-GB')}</td>
                                    </tr>
                                );
                            })}
                    </TableShell>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                TAB 4 — EXPORT
            ══════════════════════════════════════════════════════ */}
            {activeTab === 'export' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard label="Total Shipments"   value={String(filteredShipments.length)}  icon={Plane}    iconBg="bg-blue-50 dark:bg-blue-900/20 text-blue-600"    trend="neutral" trendLabel="In selected period" />
                        <KpiCard label="Dispatched"        value={String(dispatched.length)}          icon={Plane}    iconBg="bg-green-50 dark:bg-green-900/20 text-green-600"  trend="up"      trendLabel="Successfully sent" />
                        <KpiCard label="Total Exported"    value={`${(totalExportedKg / 1000).toFixed(2)} Tons`} icon={Package} iconBg="bg-purple-50 dark:bg-purple-900/20 text-purple-600" trend="up" trendLabel="Weight dispatched" />
                        <KpiCard label="Avg Shipment Size" value={dispatched.length ? `${(totalExportedKg / dispatched.length / 1000).toFixed(2)} T` : '—'} icon={BarChart3} iconBg="bg-amber-50 dark:bg-amber-900/20 text-amber-600" trend="neutral" trendLabel="Per dispatched shipment" />
                    </div>
                    <div className={chartCard}>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Export Volume Over Time</h2>
                        <p className="text-xs text-gray-400 mb-4">Shipment count and weight in Tons</p>
                        {monthlyShipmentData.length === 0
                            ? <p className="text-sm text-gray-400 py-8 text-center">No shipment data in this period.</p>
                            : <ResponsiveContainer width="100%" height={220}>
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
                        }
                    </div>
                    <TableShell title="All Shipments in Period"
                        headers={['PL Number', 'Flight', 'Destination', 'Client', 'Weight (kg)', 'Boxes', 'Status', 'Departure']}
                        total={filteredShipments.length} page={shipmentPage} perPage={PER_PAGE} onPage={setShipmentPage}>
                        {pagedShipments.length === 0 ? <EmptyRow cols={8} /> :
                            pagedShipments.map(s => (
                                <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{s.plNumber || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.flightNumber || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.destination || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.clientName || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{(s.totalWeightKg || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.totalBoxes || 0}</td>
                                    <td className="px-4 py-3"><Badge status={s.status} /></td>
                                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{s.departureDate ? new Date(s.departureDate).toLocaleDateString('en-GB') : '—'}</td>
                                </tr>
                            ))}
                    </TableShell>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                TAB 5 — USER ACTIVITY
            ══════════════════════════════════════════════════════ */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard label="Total Users"       value={String(users.length)}                              icon={Users} iconBg="bg-gray-100 dark:bg-gray-700 text-gray-500"         trend="neutral" trendLabel="System accounts" />
                        <KpiCard label="Admins"            value={String(users.filter(u => u.role === 'admin').length)} icon={Users} iconBg="bg-purple-50 dark:bg-purple-900/20 text-purple-600" trend="neutral" trendLabel="Admin accounts" />
                        <KpiCard label="Active Users"      value={String(users.filter(u => u.isActive).length)}      icon={Users} iconBg="bg-green-50 dark:bg-green-900/20 text-green-600"   trend="up"      trendLabel="Approved accounts" />
                        <KpiCard label="Pending Approval"  value={String(users.filter(u => !u.isActive).length)}     icon={Users} iconBg="bg-amber-50 dark:bg-amber-900/20 text-amber-600"   trend="neutral" trendLabel="Awaiting activation" />
                    </div>
                    <div className={chartCard}>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">User Distribution by Role</h2>
                        <p className="text-xs text-gray-400 mb-4">Number of accounts per system role</p>
                        {roleData.length === 0
                            ? <p className="text-sm text-gray-400 text-center py-4">No user data.</p>
                            : <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={roleData} layout="vertical" barSize={16}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                    <YAxis type="category" dataKey="role" tick={{ fontSize: 11, fill: '#6b7280' }} width={130} />
                                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                                    <Bar dataKey="count" fill="#22c55e" radius={[0,4,4,0]} name="Users" />
                                </BarChart>
                            </ResponsiveContainer>
                        }
                    </div>
                    <TableShell title="All System Users"
                        headers={['Name', 'Email', 'Role', 'Phone', 'Status', 'Joined']}
                        total={users.length} page={userPage} perPage={PER_PAGE} onPage={setUserPage}>
                        {pagedUsers.length === 0 ? <EmptyRow cols={6} msg="No users found." /> :
                            pagedUsers.map(u => (
                                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{u.name}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 capitalize">{(u.role || '').replace(/_/g, ' ')}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.phone || '—'}</td>
                                    <td className="px-4 py-3"><Badge status={u.isActive ? 'Active' : 'Inactive'} /></td>
                                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                                </tr>
                            ))}
                    </TableShell>
                </div>
            )}
        </div>
    );
};

export default Reports;
