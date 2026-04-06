import { useState } from 'react';
import {
    Search, Filter, Download, Plus, MoreHorizontal,
    Package, DollarSign, Layers,
    Leaf, ArrowRight, Printer, Clock,
    ChevronDown, FileSpreadsheet, FileText
} from 'lucide-react';
import LogIntakeModal from '../components/LogIntakeModal';
import QCSortingModal from '../components/QCSortingModal';
import CreateExportBatchModal from '../components/CreateExportBatchModal';
import BatchDetailModal from '../components/BatchDetailModal';
import Pagination from '../../shared/component/Pagination';
import MoveToColdRoomModal, { ApprovedIntake } from '../components/MoveToColdRoomModal';

const InventoryManagement = () => {
    // Tab State: 'intake' | 'inventory' | 'export'
    const [activeTab, setActiveTab] = useState('active_inventory');

    // Modal States
    const [isIntakeOpen, setIsIntakeOpen] = useState(false);
    const [isQCOpen, setIsQCOpen] = useState(false);
    const [isExportBatchOpen, setIsExportBatchOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    // Selected Item States
    const [selectedIntakeId, setSelectedIntakeId] = useState('');
    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const [selectedApprovedIntake, setSelectedApprovedIntake] = useState<ApprovedIntake | null>(null);

    // Action Menu State
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Stock tab filter
    const [produceFilter, setProduceFilter] = useState<string>('all');
    // Global search
    const [searchTerm, setSearchTerm] = useState<string>('');
    // Pagination
    const [intakePage, setIntakePage] = useState(1);
    const [inventoryPage, setInventoryPage] = useState(1);
    const [exportPage, setExportPage] = useState(1);
    const [activityPage, setActivityPage] = useState(1);
    const itemsPerPage = 3;

    // --- DERIVED / FILTERED DATA ---

    // Tab 1: Intake (Receiving)
    const intakeItems = [
        { id: 'INT-2026-001', arrival: 'Today, 08:30 AM', farmer: 'Kinvest Farm', produce: 'Avocados', weight: '1,200 kg', status: 'Pending QC' },
        { id: 'INT-2026-002', arrival: 'Today, 10:15 AM', farmer: 'Jean Claude', produce: 'French Beans', weight: '350 kg', status: 'Pending QC' },
        { id: 'INT-2026-003', arrival: 'Yesterday, 04:00 PM', farmer: 'Cooperative A', produce: 'Chili', weight: '400 kg', status: 'Approved' },
    ];

    // Tab 2: Inventory (Stock)
    const [inventoryItems, setInventoryItems] = useState([
        { id: 'STK-AVO-26', produce: 'Avocados (Hass)', grade: 'A', weight: '4,200 kg', location: 'Cold Room A', temp: '4.2°C', status: 'Available', daysInStorage: 3, shelfLifeDays: 18 },
        { id: 'STK-AVO-27', produce: 'Avocados (Hass)', grade: 'A', weight: '1,500 kg', location: 'Cold Room B', temp: '4.5°C', status: 'Reserved', daysInStorage: 9, shelfLifeDays: 18 },
        { id: 'STK-CHI-12', produce: 'Bird Eye Chili', grade: 'A', weight: '600 kg', location: 'Ambient', temp: '18°C', status: 'Available', daysInStorage: 2, shelfLifeDays: 10 },
        { id: 'STK-MAN-05', produce: 'Mangoes (Apple)', grade: 'A', weight: '2,100 kg', location: 'Cold Room A', temp: '5.0°C', status: 'Allocated', daysInStorage: 6, shelfLifeDays: 7 },
    ]);

    // New: Approved Intakes waiting to be moved to storage
    const [approvedIntakes, setApprovedIntakes] = useState<ApprovedIntake[]>([
        { intakeId: 'INT-2026-003', farmer: 'Cooperative A', crop: 'Bird Eye Chili', netWeight: 380, grade: 'Grade A (Export)' },
        { intakeId: 'INT-2026-004', farmer: 'Jean Claude', crop: 'French Beans', netWeight: 320, grade: 'Grade B (Local Market)' },
    ]);

    // Tab 3: Export Batches
    const exportBatches = [
        { id: 'B-2026-001', client: 'Nature Pride', dest: 'Rotterdam, NL', composition: 'Avocado (Grade A) - 1.2T', date: 'Jan 29', status: 'Planned' },
        { id: 'B-2026-002', client: 'Carrefour UAE', dest: 'Dubai, UAE', composition: 'Mangoes - 800kg', date: 'Feb 02', status: 'Packing' },
    ];

    // Tab 4: Recent Activity
    const activityItems = [
        { id: 'ACT-001', time: '10:45 AM', type: 'Stock Adjustment', description: 'Removed spoiled avocados from Cold Room A', impact: '- 12kg', impactType: 'negative', user: 'John (Manager)' },
        { id: 'ACT-002', time: '10:30 AM', type: 'QC Inspection', description: 'Graded Intake #INT-2026-001', impact: '+ 1,200kg Stock', impactType: 'positive', user: 'Sarah M. (QC)' },
        { id: 'ACT-003', time: '09:15 AM', type: 'Intake Logged', description: 'Received Raw Beans from Kinvest', impact: '+ 1,250kg Raw', impactType: 'positive', user: 'Gate Clerk' },
        { id: 'ACT-004', time: 'Yesterday', type: 'Export Batch', description: 'Allocated stock to Order #ORD-005', impact: '- 500kg Stock', impactType: 'negative', user: 'System (Auto)' },
    ];

    // Weight parser helper
    const parseKg = (w: string) => parseFloat(w.replace(/,/g, '').replace(' kg', ''));

    const lowerSearch = searchTerm.toLowerCase();

    // Filtered inventory for stock tab
    const filteredInventory = inventoryItems.filter(i => {
        const matchesProduce = produceFilter === 'all' || i.produce === produceFilter;
        const matchesSearch = !searchTerm || i.id.toLowerCase().includes(lowerSearch) || i.produce.toLowerCase().includes(lowerSearch) || i.location.toLowerCase().includes(lowerSearch);
        return matchesProduce && matchesSearch;
    });

    // Filtered intake for today's intake (respects same produce filter)
    const filteredIntake = intakeItems.filter(i => {
        const matchesProduce = produceFilter === 'all' || i.produce === produceFilter;
        const matchesSearch = !searchTerm || i.id.toLowerCase().includes(lowerSearch) || i.farmer.toLowerCase().includes(lowerSearch) || i.produce.toLowerCase().includes(lowerSearch);
        return matchesProduce && matchesSearch;
    });

    const filteredExportBatches = exportBatches.filter(b => {
        const matchesProduce = produceFilter === 'all' || b.composition.toLowerCase().includes(produceFilter.toLowerCase().replace(' (hass)', '').replace(' apple)', '').replace('bird eye ', ''));
        const matchesSearch = !searchTerm || b.id.toLowerCase().includes(lowerSearch) || b.client.toLowerCase().includes(lowerSearch) || b.dest.toLowerCase().includes(lowerSearch) || b.composition.toLowerCase().includes(lowerSearch);
        return matchesProduce && matchesSearch;
    });

    const filteredActivity = activityItems.filter(a => {
        const matchesSearch = !searchTerm || a.type.toLowerCase().includes(lowerSearch) || a.description.toLowerCase().includes(lowerSearch) || a.user.toLowerCase().includes(lowerSearch);
        return matchesSearch;
    });

    // Stats — reactive to produceFilter and searchTerm
    const totalStockKg = filteredInventory.reduce((sum, i) => sum + parseKg(i.weight), 0);
    const totalStockTons = (totalStockKg / 1000).toFixed(1);
    const intakeTodayKg = filteredIntake
        .filter(i => i.arrival.startsWith('Today'))
        .reduce((sum, i) => sum + parseKg(i.weight), 0);
    // Simple mock price per kg per produce
    const PRICE_PER_KG: Record<string, number> = { 'Avocados (Hass)': 2.5, 'Bird Eye Chili': 3.0, 'Mangoes (Apple)': 1.8 };
    const totalValue = filteredInventory.reduce((sum, i) => {
        const price = PRICE_PER_KG[i.produce] ?? 2.0;
        return sum + parseKg(i.weight) * price;
    }, 0);
    const activeExports = filteredExportBatches.length;

    const summaryStats = [
        { label: 'Total Stock', value: `${totalStockTons} Tons`, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Raw Intake (Today)', value: `${intakeTodayKg.toLocaleString()} kg`, icon: Leaf, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Value in Stock', value: `$${Math.round(totalValue / 100) * 100 < 1000 ? Math.round(totalValue) : (totalValue / 1000).toFixed(1) + 'K'}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Active Exports', value: `${activeExports} Batches`, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ];

    // --- HANDLERS ---

    const handlePerformQC = (intakeId: string) => {
        setSelectedIntakeId(intakeId);
        setIsQCOpen(true);
    };

    const handleConfirmMoveToColdRoom = (location: string, temp: string) => {
        if (!selectedApprovedIntake) return;

        // Remove from approved queue
        setApprovedIntakes(prev => prev.filter(i => i.intakeId !== selectedApprovedIntake.intakeId));

        // Add to inventory
        const newStockItem = {
            id: `STK-${selectedApprovedIntake.crop.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 90) + 10}`,
            produce: selectedApprovedIntake.crop,
            grade: selectedApprovedIntake.grade.includes('A') ? 'A' : 'B',
            weight: `${selectedApprovedIntake.netWeight.toLocaleString()} kg`,
            location,
            temp,
            status: 'Available',
            daysInStorage: 0,
            shelfLifeDays: selectedApprovedIntake.crop.includes('Avocado') ? 18 : 10, // Mock shelf life
        };

        setInventoryItems(prev => [newStockItem, ...prev]);
    };

    return (
        <div className="space-y-6 pb-20">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory & Batch Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track intake, stock, and export allocation.</p>
                </div>
                <div className="flex gap-3">
                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsExportOpen(prev => !prev)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Download size={18} />
                            Export Report
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isExportOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsExportOpen(false)} />
                                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
                                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Export Options</p>
                                    <button
                                        onClick={() => { alert('Exporting as Excel…'); setIsExportOpen(false); }}
                                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                    >
                                        <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg flex-shrink-0">
                                            <FileSpreadsheet size={16} className="text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">Export Excel</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">Spreadsheet (.xlsx)</p>
                                        </div>
                                    </button>
                                    <div className="mx-4 border-t border-gray-100 dark:border-gray-700" />
                                    <button
                                        onClick={() => { alert('Exporting as PDF…'); setIsExportOpen(false); }}
                                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                    >
                                        <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg flex-shrink-0">
                                            <FileText size={16} className="text-red-500 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">Export PDF</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">Printable report (.pdf)</p>
                                        </div>
                                    </button>
                                    <div className="pb-2" />
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => setIsIntakeOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Log Raw Intake
                    </button>
                    <button
                        onClick={() => setIsExportBatchOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Create Export Batch
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-6">
                {summaryStats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <div className={`text-2xl font-bold mt-1 ${stat.color.replace('text-', 'text-gray-900 dark:text-white ')}`}>
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

            {/* Main Content Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[400px]">

                {/* Table Header & Controls */}
                <div className="border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between p-4">

                        {/* 3-Lifecycle Tabs */}
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('intake')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'intake'
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                Intake (Receiving)
                            </button>
                            <button
                                onClick={() => setActiveTab('active_inventory')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'active_inventory'
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                Inventory (Stock)
                            </button>
                            <button
                                onClick={() => setActiveTab('export_batches')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'export_batches'
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                Export Batches
                            </button>
                            <button
                                onClick={() => setActiveTab('recent_activity')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'recent_activity'
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                Recent Activity
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            {activeTab === 'active_inventory' && (
                                <div className="relative">
                                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <select
                                        value={produceFilter}
                                        onChange={(e) => setProduceFilter(e.target.value)}
                                        className="pl-8 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer"
                                    >
                                        <option value="all">All Produce</option>
                                        {[...new Set(inventoryItems.map(i => i.produce))].map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- TAB 1: INTAKE VIEW --- */}
                {activeTab === 'intake' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="px-6 py-4">Intake ID</th>
                                    <th className="px-6 py-4">Arrival Time</th>
                                    <th className="px-6 py-4">Farmer / Source</th>
                                    <th className="px-6 py-4">Crop</th>
                                    <th className="px-6 py-4">Gross Weight</th>
                                    <th className="px-6 py-4">QC Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredIntake.slice((intakePage - 1) * itemsPerPage, intakePage * itemsPerPage).map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm font-bold text-gray-700 dark:text-gray-300">{item.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.arrival}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.farmer}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.produce}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">{item.weight}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'Pending QC' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {item.status === 'Pending QC' && (
                                                <div className="flex items-center justify-end gap-2 relative">
                                                    <button
                                                        onClick={() => handlePerformQC(item.id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                    >
                                                        Perform QC <ArrowRight size={12} className="ml-1" />
                                                    </button>
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id); }}
                                                            onBlur={() => setTimeout(() => setOpenMenuId(null), 150)}
                                                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                        >
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                        {openMenuId === item.id && (
                                                            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden text-left">
                                                                <button
                                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                >
                                                                    Void Intake
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination currentPage={intakePage} totalItems={filteredIntake.length} itemsPerPage={itemsPerPage} onPageChange={setIntakePage} />
                    </div>
                )}

                {/* --- TAB 2: INVENTORY VIEW --- */}
                {activeTab === 'active_inventory' && (
                    <div className="flex flex-col">

                        {/* Awaiting Storage Queue */}
                        {approvedIntakes.length > 0 && (
                            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    Approved Intakes Awaiting Storage
                                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 py-0.5 px-2 rounded-full text-xs font-bold">{approvedIntakes.length}</span>
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    {approvedIntakes.map(intake => (
                                        <div key={intake.intakeId} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30 shadow-sm">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{intake.netWeight.toLocaleString()} kg <span className="text-gray-500 font-medium">of</span> {intake.crop}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">From: {intake.farmer} <span className="opacity-50 mx-1">|</span> Ref: {intake.intakeId}</p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedApprovedIntake(intake)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                                            >
                                                Move to Cold Room <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        <th className="px-6 py-4">Stock ID</th>
                                        <th className="px-6 py-4">Produce</th>
                                        <th className="px-6 py-4">Grade</th>
                                        <th className="px-6 py-4">Available Weight</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Avg Temp</th>
                                        <th className="px-6 py-4">Shelf Life</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredInventory.slice((inventoryPage - 1) * itemsPerPage, inventoryPage * itemsPerPage).map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm font-bold text-gray-700 dark:text-gray-300">{item.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.produce}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${item.grade === 'A' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    Grade {item.grade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">{item.weight}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.location}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.temp}</td>
                                            <td className="px-6 py-4">
                                                {(() => {
                                                    const daysLeft = item.shelfLifeDays - item.daysInStorage;
                                                    const isUrgent = daysLeft <= 2;
                                                    const isWarning = daysLeft <= 5 && daysLeft > 2;
                                                    const urgencyLabel = daysLeft <= 0
                                                        ? 'Expiring today!'
                                                        : daysLeft === 1
                                                            ? '1 day left — URGENT'
                                                            : `${daysLeft} days left`;
                                                    const urgencyColor = isUrgent
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : isWarning
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : 'text-emerald-600 dark:text-emerald-400';
                                                    const bgColor = isUrgent
                                                        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40'
                                                        : isWarning
                                                            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40'
                                                            : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40';
                                                    return (
                                                        <div className={`inline-flex flex-col px-2.5 py-1.5 rounded-lg ${bgColor}`}>
                                                            <span className={`text-xs font-bold ${urgencyColor} flex items-center gap-1`}>
                                                                <Clock size={10} />
                                                                {urgencyLabel}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 mt-0.5">
                                                                In storage: {item.daysInStorage}d / {item.shelfLifeDays}d
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'Available' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                    item.status === 'Reserved' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                        'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative inline-block text-left">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id); }}
                                                        onBlur={() => setTimeout(() => setOpenMenuId(null), 150)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                    {openMenuId === item.id && (
                                                        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden text-left">
                                                            <div className="p-1 gap-1 flex flex-col">
                                                                <button
                                                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg font-medium transition-colors"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                >
                                                                    Adjust Stock
                                                                </button>
                                                                <button
                                                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                >
                                                                    Mark as Spoiled
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination currentPage={inventoryPage} totalItems={filteredInventory.length} itemsPerPage={itemsPerPage} onPageChange={setInventoryPage} />
                        </div>
                    </div>
                )}

                {/* --- TAB 3: EXPORT BATCHES VIEW --- */}
                {activeTab === 'export_batches' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="px-6 py-4">Batch ID</th>
                                    <th className="px-6 py-4">Client / Destination</th>
                                    <th className="px-6 py-4">Composition</th>
                                    <th className="px-6 py-4">Shipment Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredExportBatches.slice((exportPage - 1) * itemsPerPage, exportPage * itemsPerPage).map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm font-bold text-gray-700 dark:text-gray-300">{item.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{item.client}</span>
                                                <span className="text-xs text-gray-500">{item.dest}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.composition}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.date}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedBatch(item);
                                                    setIsBatchModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-semibold rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                                            >
                                                Manage Batch
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination currentPage={exportPage} totalItems={filteredExportBatches.length} itemsPerPage={itemsPerPage} onPageChange={setExportPage} />
                    </div>
                )}

                {/* --- TAB 4: RECENT ACTIVITY VIEW --- */}
                {activeTab === 'recent_activity' && (
                    <div className="flex flex-col">
                        {/* Search Bar for Activity */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search Activities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        <th className="px-6 py-4">Time</th>
                                        <th className="px-6 py-4">Activity</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Impact</th>
                                        <th className="px-6 py-4">Performed By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredActivity.slice((activityPage - 1) * itemsPerPage, activityPage * itemsPerPage).map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                {item.time}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${item.type === 'Intake Logged' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                    item.type === 'QC Inspection' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        item.type === 'Stock Adjustment' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                    }`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                {item.description}
                                            </td>
                                            <td className={`px-6 py-4 text-sm font-bold ${item.impactType === 'positive'
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-500 dark:text-red-400'
                                                }`}>
                                                {item.impact}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {item.user}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={activityPage} totalItems={filteredActivity.length} itemsPerPage={itemsPerPage} onPageChange={setActivityPage} />
                    </div>
                )}
            </div>

            {/* --- DRAWERS --- */}

            {/* Modal 1: Log Intake */}
            <LogIntakeModal
                isOpen={isIntakeOpen}
                onClose={() => setIsIntakeOpen(false)}
                onSubmit={() => setIsIntakeOpen(false)}
            />

            {/* Modal 2: QC & Sorting */}
            <QCSortingModal
                isOpen={isQCOpen}
                onClose={() => setIsQCOpen(false)}
                intakeId={selectedIntakeId}
                onConfirm={() => {
                    // Logic to move item from Intake -> Inventory
                    setIsQCOpen(false);
                }}
            />

            {/* Modal 3: Create Export Batch */}
            <CreateExportBatchModal
                isOpen={isExportBatchOpen}
                onClose={() => setIsExportBatchOpen(false)}
                onSuccess={() => {
                    // Logic to create batch from Inventory
                    setActiveTab('export_batches'); // Switch to exports tab
                }}
            />

            {/* Modal 4: Manage Batch Detail */}
            <BatchDetailModal
                isOpen={isBatchModalOpen}
                onClose={() => {
                    setIsBatchModalOpen(false);
                    setTimeout(() => setSelectedBatch(null), 200);
                }}
                batch={selectedBatch}
            />

            {/* Modal 5: Move To Cold Room */}
            <MoveToColdRoomModal
                isOpen={!!selectedApprovedIntake}
                onClose={() => setSelectedApprovedIntake(null)}
                data={selectedApprovedIntake}
                onSubmit={handleConfirmMoveToColdRoom}
            />

        </div>
    );
};

export default InventoryManagement;
