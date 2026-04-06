import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    Download, Calendar, Filter, ChevronDown, TrendingUp, TrendingDown,
    DollarSign, Package, AlertOctagon, CheckCircle, Users, Truck, Factory,
    Leaf, Activity, FileText, ArrowDown, FileSpreadsheet, Image
} from 'lucide-react';

// --- Mock Data ---

const revenueData = [
    { name: 'Jan', revenue: 45000, target: 40000 },
    { name: 'Feb', revenue: 52000, target: 42000 },
    { name: 'Mar', revenue: 48000, target: 45000 },
    { name: 'Apr', revenue: 61000, target: 48000 },
    { name: 'May', revenue: 55000, target: 50000 },
    { name: 'Jun', revenue: 67000, target: 55000 },
];

const costData = [
    { name: 'Labor', value: 35 },
    { name: 'Inputs', value: 25 },
    { name: 'Freight', value: 30 },
    { name: 'Packaging', value: 10 },
];

const wasteData = [
    { name: 'Mechanical', value: 45 },
    { name: 'Pests', value: 20 },
    { name: 'Undersized', value: 25 },
    { name: 'Other', value: 10 },
];

const supplyConsistencyData = [
    { name: 'W1', kinvest: 100, coop: 80 },
    { name: 'W2', kinvest: 95, coop: 85 },
    { name: 'W3', kinvest: 98, coop: 70 },
    { name: 'W4', kinvest: 100, coop: 90 },
];

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

// --- Mock Functions for Market & Demand ---
const getFarmYieldForecasts = () => [
    { week: 'W40', supply: 1200, demand: 1100 },
    { week: 'W41', supply: 1300, demand: 1250 },
    { week: 'W42', supply: 1150, demand: 1400 }, // Supply Gap
    { week: 'W43', supply: 1400, demand: 1350 },
    { week: 'W44', supply: 1500, demand: 1450 },
];

const getActiveClientOrders = () => {
    // Merged into getFarmYieldForecasts for visualization simplicity
    return getFarmYieldForecasts().map(d => ({ week: d.week, demand: d.demand }));
};

const getPriceTrends = () => [
    { month: 'Jun', price: 4.5 },
    { month: 'Jul', price: 4.8 },
    { month: 'Aug', price: 4.2 }, // Low season
    { month: 'Sep', price: 5.1 },
    { month: 'Oct', price: 5.5 }, // Peak demand
    { month: 'Nov', price: 5.3 },
];

const forecastData = getFarmYieldForecasts();
const priceData = getPriceTrends();

const AnalyticsReporting = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    const handleExport = (type: string) => {
        setIsExportMenuOpen(false);
        if (type === 'csv') {
            alert(`Exporting ${activeTab.toUpperCase()} data to CSV...`);
        } else if (type === 'snapshot') {
            alert('Capturing dashboard snapshot (PDF)...');
        } else if (type === 'report') {
            alert('Generating comprehensive Management Report...');
        }
    };

    // --- Components ---

    const KPICard = ({ title, value, sub, icon: Icon, color, trend }: any) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
                <div className={`flex items-center text-xs font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                    {sub}
                </div>
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            {/* 1. Global Control Bar */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 py-4 px-6 -mx-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reporting</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">Business health monitor and strategic insights.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Date Range Picker */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <div className="flex items-center px-3 gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Calendar size={16} />
                            <span className="hidden sm:inline">From:</span>
                            <input type="date" className="bg-transparent border-none focus:ring-0 p-1 text-gray-900 dark:text-white text-xs sm:text-sm" />
                            <span className="hidden sm:inline">To:</span>
                            <input type="date" className="bg-transparent border-none focus:ring-0 p-1 text-gray-900 dark:text-white text-xs sm:text-sm" />
                        </div>
                        <button className="px-4 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-semibold rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            Apply
                        </button>
                    </div>

                    {/* Export Tools */}
                    <div className="relative z-50 w-full sm:w-auto">
                        <button
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
                        >
                            <Download size={16} />
                            Export Data
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isExportMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsExportMenuOpen(false)} />
                                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                                    <div className="p-1">
                                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Export Options</span>
                                        </div>
                                        <button
                                            onClick={() => handleExport('csv')}
                                            className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group/item"
                                        >
                                            <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg group-hover/item:bg-green-100 dark:group-hover/item:bg-green-900/40">
                                                <FileSpreadsheet size={18} />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">Export CSV</span>
                                                <span className="block text-xs text-gray-500">Raw data for current view</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleExport('snapshot')}
                                            className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group/item"
                                        >
                                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg group-hover/item:bg-purple-100 dark:group-hover/item:bg-purple-900/40">
                                                <Image size={18} />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">Dashboard Snapshot</span>
                                                <span className="block text-xs text-gray-500">Save current view as Image/PDF</span>
                                            </div>
                                        </button>

                                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

                                        <button
                                            onClick={() => handleExport('report')}
                                            className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group/item"
                                        >
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-900/40">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">Management Report</span>
                                                <span className="block text-xs text-gray-500">Full 6-tab executive summary</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Navigation Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1">
                <nav className="flex space-x-8 min-w-max">
                    {[
                        { id: 'overview', label: 'Business Overview' },
                        { id: 'financial', label: 'Financial Performance' },
                        { id: 'production', label: 'Production & Waste' },
                        { id: 'quality', label: 'Quality & Safety' },
                        { id: 'supplier', label: 'Supplier Performance' },
                        { id: 'market', label: 'Market & Demand' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-green-600 text-green-600 dark:text-green-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* 3. Tab Content */}
            <div className="min-h-[500px]">

                {/* TAB 1: BUSINESS OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KPICard title="Net Profit (YTD)" value="$245,600" sub="+12% from last year" icon={DollarSign} color="text-green-600 bg-green-50" trend="up" />
                            <KPICard title="Total Volume Exported" value="1,240 Tons" sub="+5% vs Target" icon={Package} color="text-blue-600 bg-blue-50" trend="up" />
                            <KPICard title="Order Fulfillment" value="96.5%" sub="-1.2% from last month" icon={Truck} color="text-purple-600 bg-purple-50" trend="down" />
                            <KPICard title="Rejection Rate" value="3.2%" sub="+0.5% (Needs Action)" icon={AlertOctagon} color="text-red-600 bg-red-50" trend="down" />
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Monthly Revenue vs. Targets</h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} tickFormatter={(val) => `$${val / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            formatter={(value) => [`$${value}`, '']}
                                        />
                                        <Legend />
                                        <Bar dataKey="revenue" name="Actual Revenue" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                                        <Bar dataKey="target" name="Target" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: FINANCIAL PERFORMANCE */}
                {activeTab === 'financial' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Costs Breakdown */}
                            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Cost Breakdown Overview</h3>
                                <p className="text-sm text-gray-500 mb-6">Distribution of operational expenses.</p>
                                <div className="h-80 w-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={costData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {costData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Profit by Crop */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Profitability by Crop</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Avocado (Hass)', profit: 12500, margin: '22%' },
                                        { name: 'Chili (Bird Eye)', profit: -2100, margin: '-5%' },
                                        { name: 'French Beans', profit: 5400, margin: '12%' },
                                        { name: 'Passion Fruit', profit: 3200, margin: '15%' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                                <p className="text-xs text-gray-500">Margin: {item.margin}</p>
                                            </div>
                                            <span className={`font-bold ${item.profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {item.profit > 0 ? '+' : ''}${item.profit.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-6 py-2 px-4 border border-dashed border-gray-300 text-gray-500 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                                    Go to Crop Budgets
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: PRODUCTION & WASTE */}
                {activeTab === 'production' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* The Loss Funnel */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Production Yield Funnel</h3>
                                <div className="space-y-6 relative">
                                    {[
                                        { stage: 'Intake Weight', val: '1,500 kg', pct: '100%', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
                                        { stage: 'Sorted Weight', val: '1,350 kg', pct: '90%', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' },
                                        { stage: 'Exported Weight', val: '1,310 kg', pct: '87.3%', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
                                    ].map((step, i) => (
                                        <div key={i} className="relative z-10 flex flex-col items-center">
                                            <div className={`w-full max-w-sm py-4 px-6 rounded-xl ${step.color} text-center shadow-sm`}>
                                                <h4 className="text-sm font-semibold uppercase opacity-70 mb-1">{step.stage}</h4>
                                                <p className="text-2xl font-bold">{step.val}</p>
                                                <span className="text-xs font-mono bg-white/50 px-2 py-0.5 rounded mt-1 inline-block">{step.pct} yield</span>
                                            </div>
                                            {i < 2 && <ArrowDown size={24} className="text-gray-300 my-2" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Waste by Reason */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Waste Analysis</h3>
                                <p className="text-sm text-gray-500 mb-6">Primary causes for rejection during sorting.</p>
                                <div className="h-80 w-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={wasteData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label
                                            >
                                                {wasteData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: QUALITY & SAFETY */}
                {activeTab === 'quality' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* KPI Cards Reuse */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-900/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-sm font-medium text-green-800 dark:text-green-300">Pass Rate</span>
                                        <h3 className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">94.2%</h3>
                                    </div>
                                    <CheckCircle className="text-green-600" size={24} />
                                </div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-100 dark:border-red-900/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-sm font-medium text-red-800 dark:text-red-300">Critical Defects</span>
                                        <h3 className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">3</h3>
                                        <span className="text-xs text-red-700 dark:text-red-400">Active incidents</span>
                                    </div>
                                    <AlertOctagon className="text-red-600" size={24} />
                                </div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Avg Quality Score</span>
                                        <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">91/100</h3>
                                    </div>
                                    <Activity className="text-blue-600" size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Inspection Log Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 dark:text-white">Detailed Inspection History</h3>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Filter</button>
                                    <button className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">Download CSV</button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-medium uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">Date / Time</th>
                                            <th className="px-6 py-4">Batch Ref</th>
                                            <th className="px-6 py-4">Inspector</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Issues Found</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {[
                                            { date: 'Oct 24, 09:30', batch: 'B-2025-081', u: 'Sarah M.', status: 'Pass', issues: 'None', grade: 'A' },
                                            { date: 'Oct 23, 14:15', batch: 'B-2025-079', u: 'John D.', status: 'Fail', issues: 'High Moisture (18%)', grade: 'C' },
                                            { date: 'Oct 23, 11:00', batch: 'B-2025-078', u: 'Sarah M.', status: 'Pass', issues: 'Minor Bruising', grade: 'B' },
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{row.date}</td>
                                                <td className="px-6 py-4 font-mono text-gray-500">{row.batch}</td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{row.u}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{row.issues}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-blue-600 hover:underline">View Report</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 5: SUPPLIER PERFORMANCE */}
                {activeTab === 'supplier' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Farmers by Volume */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top 5 Farmers (Volume)</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Kinvest Farm', vol: '45 Tons', trend: '+12%' },
                                        { name: 'Rusizi Co-op', vol: '32 Tons', trend: '-5%' },
                                        { name: 'Jean-Claude', vol: '18 Tons', trend: '+2%' },
                                    ].map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">{i + 1}</div>
                                                <span className="font-semibold text-gray-900 dark:text-white">{f.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{f.vol}</div>
                                                <div className="text-xs text-green-600">{f.trend}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Supply Consistency Chart */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Supply Consistency</h3>
                                <p className="text-sm text-gray-500 mb-6">Weekly delivery fulfillment rates.</p>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={supplyConsistencyData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="kinvest" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                                            <Line type="monotone" dataKey="coop" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 6: MARKET & DEMAND */}
                {activeTab === 'market' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Supply vs Demand Forecast */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Supply vs. Demand Forecast</h3>
                                        <p className="text-sm text-gray-500">Predicted inventory vs. confirmed orders.</p>
                                    </div>
                                    {forecastData.some(d => d.demand > d.supply) && (
                                        <div className="flex items-center px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                                            <AlertOctagon size={14} className="mr-1" />
                                            Supply Gap Detected
                                        </div>
                                    )}
                                </div>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={forecastData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Legend verticalAlign="top" height={36} />
                                            <Line type="monotone" dataKey="supply" name="Supply Forecast" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                                            <Line type="monotone" dataKey="demand" name="Demand (Orders)" stroke="#EF4444" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Average Selling Price Trends */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Avg. Selling Price Trends</h3>
                                <p className="text-sm text-gray-500 mb-6">Historical unit price performance ($/kg).</p>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={priceData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} tickFormatter={(val) => `$${val}`} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                formatter={(value) => [`$${value}`, 'Avg Price']}
                                            />
                                            <Bar dataKey="price" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40}>
                                                {priceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.price >= 5 ? '#10B981' : '#3B82F6'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AnalyticsReporting;
