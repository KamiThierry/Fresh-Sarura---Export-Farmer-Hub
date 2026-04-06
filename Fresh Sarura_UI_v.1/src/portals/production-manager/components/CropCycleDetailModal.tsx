import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Wallet, ClipboardList, FileText,
    CheckCircle2, Clock, AlertCircle,
    TrendingUp, FileBarChart, ShieldCheck,
    Target, Coins, Activity, Sprout,
    ThumbsUp, ThumbsDown, ListChecks,
    Lock, Plus, Camera, Image
} from 'lucide-react';
import EvidenceViewModal from './EvidenceViewModal';
import BudgetLedgerModal from './BudgetLedgerModal';
import type { BudgetRequest } from '../../shared/types/activity';
import { useEffect } from 'react';
import { getForecasts, saveForecasts, YieldForecast } from '../../shared/data/mockForecasts';

interface CropCycleDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    cycle: any;
    onCloseCycle?: (finalYield: string) => void;
}

// Mock Pending Budget Requests (from FM)
const MOCK_BUDGET_REQUESTS: BudgetRequest[] = [
    {
        id: 1001,
        cycleId: 1,
        cycleName: 'Avocado (Hass) — Season A 2026',
        submittedBy: 'Jean Claude (Site Manager)',
        submittedAt: new Date(Date.now() - 3600000).toISOString(),
        startDate: '2026-04-10',
        endDate: '2026-04-20',
        lineItems: [
            { id: 1, activityName: 'Weeding Block B1', estimatedCostRwf: 150000 },
            { id: 2, activityName: 'Apply NPK Fertilizer', estimatedCostRwf: 320000 },
            { id: 3, activityName: 'Pest Scouting & Spray', estimatedCostRwf: 220000 },
        ],
        totalRequestedRwf: 690000,
        approvalStatus: 'Pending',
    },
];

const CropCycleDetailModal = ({ isOpen, onClose, cycle, onCloseCycle }: CropCycleDetailModalProps) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'requests' | 'forecasts'>('overview');
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [selectedEvidenceTask, setSelectedEvidenceTask] = useState<any>(null);
    const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>(MOCK_BUDGET_REQUESTS);
    const [forecasts, setForecasts] = useState<YieldForecast[]>([]);
    const [replyText, setReplyText] = useState<{ [id: number]: string }>({});
    
    // New States for Financials Loop
    const [cycleStatus, setCycleStatus] = useState(cycle?.status || 'Active');
    const [isAdjustBudgetOpen, setIsAdjustBudgetOpen] = useState(false);
    const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);
    const [selectedFieldReport, setSelectedFieldReport] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            setForecasts(getForecasts());
            const handleStorage = () => setForecasts(getForecasts());
            window.addEventListener('forecastsChanged', handleStorage);
            return () => window.removeEventListener('forecastsChanged', handleStorage);
        }
    }, [isOpen]);

    if (!isOpen || !cycle) return null;

    const [ledgerDataState, setLedgerDataState] = useState({
        categories: [
            { name: 'Seeds & Seedlings', allocated: 250000, spent: 242500, variance: 7500, status: 'on_track' },
            { name: 'Fertilizers', allocated: 400000, spent: 435000, variance: -35000, status: 'over_budget' },
            { name: 'Labor (Planting)', allocated: 500000, spent: 468000, variance: 32000, status: 'on_track' },
            { name: 'Pest Control', allocated: 180000, spent: 124000, variance: 56000, status: 'under_budget' },
        ],
        recentTransactions: [
            { id: 'TX-001', date: 'Feb 10', desc: 'Field Report: NPK Fertilizer Application', amount: 72000, category: 'Fertilizers', block: 'Block B1', approvedAmount: 75000, notes: 'Added extra nitrogen as top dressing due to yellowing leaves. Work went well.', hasProof: true },
            { id: 'TX-002', date: 'Feb 08', desc: 'Field Report: Weeding Labor — Block B1', amount: 45000, category: 'Labor', block: 'Block B1', approvedAmount: 45000, notes: 'Finished weeding ahead of schedule.', hasProof: false },
        ]
    });
    
    // Derived values for Global Summary Banner
    const totalAllocatedBudget = ledgerDataState.categories.reduce((acc, cat) => acc + cat.allocated, 0);
    const totalProductionCost = ledgerDataState.categories.reduce((acc, cat) => acc + cat.spent, 0);
    const globalVariance = totalAllocatedBudget - totalProductionCost;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':     return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Planned':    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Completed':  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
            case 'Harvesting': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default:           return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getVarianceColor = (variance: number) => {
        if (variance < 0) return 'text-red-600 dark:text-red-400';
        if (variance > 0) return 'text-green-600 dark:text-green-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    const handleApproveRequest = (requestId: number) => {
        setBudgetRequests(prev =>
            prev.map(r => r.id === requestId ? { ...r, approvalStatus: 'Approved' } : r)
        );
        console.log(`Budget request #${requestId} approved. Tasks would now appear in FM checklist.`);
    };

    const handleRejectRequest = (requestId: number) => {
        setBudgetRequests(prev =>
            prev.map(r => r.id === requestId ? { ...r, approvalStatus: 'Rejected' } : r)
        );
    };

    const handleEvidenceAction = (taskId: number) => {
        setSelectedEvidenceTask(null);
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700 max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2.5 rounded-xl text-green-600 dark:text-green-400">
                            <Sprout size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {cycle.cycleId}
                                </h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(cycleStatus)} ${cycleStatus === 'Harvesting' ? 'animate-pulse' : ''}`}>
                                    {cycleStatus}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {cycle.crop} • {cycle.landSize} • {cycle.startDate} - {cycle.endDate}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {cycleStatus === 'Completed' ? (
                            <button disabled className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-sm font-bold flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 cursor-not-allowed">
                                <Lock size={16} /> Cycle Closed
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsConfirmCloseOpen(true)}
                                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-bold transition-colors flex items-center gap-1.5 border border-red-100 dark:border-red-800/50"
                            >
                                Close Crop Cycle
                            </button>
                        )}
                        <span className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></span>
                        <button
                            onClick={() => setIsReportOpen(true)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                            title="Generate Report"
                        >
                            <FileText size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
                    <div className="flex gap-6">
                        {(['overview', 'financials', 'requests', 'forecasts'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 text-sm font-medium border-b-2 transition-all capitalize ${activeTab === tab
                                    ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab === 'requests' ? 'Budget Requests' : tab === 'forecasts' ? 'Yield Forecasts' : tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-gray-900/10">

                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Key Stats Row */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Target size={18} /></div>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Yield Goal</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{cycle.yieldGoal}</p>
                                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><TrendingUp size={12} /> On track</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Coins size={18} /></div>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Used</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {Math.round((cycle.spent / cycle.budget) * 100)}%
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{cycle.spent.toLocaleString()} Rwf / {cycle.budget.toLocaleString()} Rwf</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Activity size={18} /></div>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Health Score</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">92/100</p>
                                    <p className="text-xs text-gray-500 mt-1">Excellent condition</p>
                                </div>
                            </div>

                            {/* Timeline / Progress */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cycle Progress</h3>
                                {cycleStatus === 'Harvesting' && (
                                    <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
                                        <span className="animate-pulse w-2 h-2 rounded-full bg-amber-500 inline-block" />
                                        Harvesting in progress — cycle is financially open for harvest labor requests.
                                    </div>
                                )}
                                {cycleStatus === 'Completed' && (
                                    <div className="mb-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-semibold flex items-center gap-2">
                                        <Lock size={12} /> This cycle has been closed and is now read-only.
                                    </div>
                                )}
                                <div className="relative pt-6 pb-2">
                                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full relative transition-all duration-700 ${
                                            cycleStatus === 'Completed' ? 'w-full bg-gray-400' :
                                            cycleStatus === 'Harvesting' ? 'w-full bg-amber-500' :
                                            'w-[65%] bg-green-500'
                                        }`}>
                                            {cycleStatus === 'Active' && (
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-green-500 rounded-full shadow-md"></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                                        <div className="text-center">
                                            <span className="block text-green-600">Started</span>
                                            {cycle.startDate}
                                        </div>
                                        <div className="text-center">
                                            <span className={`block font-bold ${
                                                cycleStatus === 'Harvesting' ? 'text-amber-600 dark:text-amber-400' :
                                                cycleStatus === 'Completed' ? 'text-gray-500' :
                                                'text-gray-900 dark:text-white'
                                            }`}>Current Stage</span>
                                            {cycleStatus === 'Harvesting' ? 'Harvesting' : cycleStatus === 'Completed' ? 'Closed' : 'Vegetative Growth'}
                                        </div>
                                        <div className="text-center">
                                            <span className={`block ${
                                                cycleStatus === 'Harvesting' ? 'text-amber-500 font-bold' :
                                                cycleStatus === 'Completed' ? 'text-gray-500 font-bold' :
                                                'text-gray-400'
                                            }`}>Harvest</span>
                                            {cycle.endDate}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Field Activity Feed */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Field Activity</h3>
                                    <button className="text-xs text-green-600 dark:text-green-400 font-bold hover:underline">View All</button>
                                </div>
                                <div className="space-y-3">
                                    {ledgerDataState.recentTransactions.slice(0, 3).map((tx) => (
                                        <div 
                                            key={tx.id} 
                                            onClick={() => setSelectedFieldReport(tx)}
                                            className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer group"
                                        >
                                            {tx.hasProof ? (
                                                <img 
                                                    src="https://images.unsplash.com/photo-1625246333195-58197bd47d26?auto=format&fit=crop&q=80&w=80&h=80" 
                                                    alt="Thumbnail" 
                                                    className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0 group-hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700" 
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-emerald-100 dark:border-emerald-900/30">
                                                    <FileText size={20} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate pr-2">
                                                        {tx.desc.replace('Field Report: ', '')}
                                                    </p>
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">{tx.date}</span>
                                                </div>
                                                {tx.notes && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                        "{tx.notes}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}


                    {activeTab === 'financials' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Global Summary Banner */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Global Financial Summary</h3>
                                        <div className="flex flex-wrap items-end gap-6 sm:gap-8">
                                            <div>
                                                <p className="text-gray-400 text-xs mb-1">Total Allocated</p>
                                                <p className="text-2xl font-bold text-white">{totalAllocatedBudget.toLocaleString()} Rwf</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs mb-1">Total Cost</p>
                                                <p className="text-2xl font-bold text-white">{totalProductionCost.toLocaleString()} Rwf</p>
                                            </div>
                                            <div className="border-l border-gray-600 pl-6 sm:pl-8">
                                                <p className="text-gray-400 text-xs mb-1">Global Variance</p>
                                                <p className={`text-2xl font-bold ${globalVariance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {globalVariance > 0 ? '+' : ''}{globalVariance.toLocaleString()} Rwf
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {cycleStatus !== 'Completed' && (
                                        <button
                                            onClick={() => setIsAdjustBudgetOpen(true)}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 border border-white/10 backdrop-blur-sm shadow-sm"
                                        >
                                            <Plus size={16} /> Adjust Budget
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Budget Overview Cards -- Simplified for modal */}
                            <div className="grid grid-cols-2 gap-4">
                                {ledgerDataState.categories.map((cat, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                                            <span className={`text-xs font-bold ${getVarianceColor(cat.variance)}`}>
                                                {cat.variance > 0 ? '+' : ''}{cat.variance.toLocaleString()} Rwf
                                            </span>
                                        </div>
                                        <div className="mt-auto">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>{cat.spent.toLocaleString()} actual</span>
                                                <span>{cat.allocated.toLocaleString()} allocated</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${cat.variance < 0 ? 'bg-red-500' : 'bg-green-500'}`}
                                                    style={{ width: `${Math.min(100, (cat.spent / cat.allocated) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Transactions */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 mt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Recently Logged Expenses</h3>
                                    <button
                                        onClick={() => setIsLedgerOpen(true)}
                                        className="text-xs text-blue-600 font-medium hover:underline"
                                    >
                                        View Full Ledger
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {ledgerDataState.recentTransactions.map((tx) => (
                                        <div 
                                            key={tx.id} 
                                            onClick={() => setSelectedFieldReport(tx)}
                                            className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-dashed border-gray-100 dark:border-gray-700 cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                                    <Coins size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{tx.desc}</p>
                                                    <p className="text-xs text-gray-500">{tx.date} • {tx.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-200">
                                                    -{tx.amount.toLocaleString()} Rwf
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Section header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ListChecks size={18} className="text-gray-500" />
                                    <h3 className="font-bold text-gray-900 dark:text-white">Pending Budget Requests</h3>
                                    {budgetRequests.filter(r => r.approvalStatus === 'Pending').length > 0 && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                            {budgetRequests.filter(r => r.approvalStatus === 'Pending').length} pending
                                        </span>
                                    )}
                                </div>
                            </div>

                            {budgetRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                                        <ClipboardList size={24} className="text-gray-400" />
                                    </div>
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">No Pending Requests</p>
                                    <p className="text-xs text-gray-400 mt-1">Farm managers haven't submitted any activity requests yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {budgetRequests.map(req => {
                                        const unallocatedBudget = (cycle?.budget ?? 0) - (cycle?.spent ?? 0);
                                        const isApproved = req.approvalStatus === 'Approved';
                                        const isRejected = req.approvalStatus === 'Rejected';
                                        const isPending = req.approvalStatus === 'Pending';

                                        return (
                                            <div
                                                key={req.id}
                                                className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden transition-all ${
                                                    isApproved ? 'border-green-300 dark:border-green-700' :
                                                    isRejected ? 'border-red-200 dark:border-red-800 opacity-70' :
                                                    'border-gray-200 dark:border-gray-700'
                                                }`}
                                            >
                                                {/* Request card header */}
                                                <div className="flex items-start justify-between px-5 py-4 bg-gray-50/60 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{req.submittedBy}</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                                isApproved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                isRejected ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                            }`}>
                                                                {req.approvalStatus}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {req.cycleName} &nbsp;•&nbsp; Period: {req.startDate} - {req.endDate} &nbsp;•&nbsp;
                                                            Submitted: {new Date(req.submittedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Line items table */}
                                                <div className="px-5 py-3">
                                                    <table className="w-full text-left text-xs">
                                                        <thead>
                                                            <tr className="text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-700">
                                                                <th className="pb-2 pr-4">Activity</th>
                                                                <th className="pb-2 text-right">Est. Cost</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                                            {req.lineItems.map(item => (
                                                                <tr key={item.id} className="py-1">
                                                                    <td className="py-2 pr-4 font-medium text-gray-800 dark:text-gray-200">{item.activityName}</td>
                                                                    <td className="py-2 text-right font-mono text-gray-700 dark:text-gray-300">
                                                                        {item.estimatedCostRwf.toLocaleString()}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Budget comparison footer */}
                                                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/40 dark:bg-gray-900/20">
                                                    <div className="flex items-center gap-4 text-xs font-mono">
                                                        <div>
                                                            <span className="block text-[10px] uppercase text-gray-400 mb-0.5">Total Requested</span>
                                                            <span className="font-bold text-gray-800 dark:text-gray-200">{req.totalRequestedRwf.toLocaleString()} Rwf</span>
                                                        </div>
                                                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
                                                        <div>
                                                            <span className="block text-[10px] uppercase text-gray-400 mb-0.5">Unallocated Remaining</span>
                                                            <span className={`font-bold ${unallocatedBudget < req.totalRequestedRwf ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                                {unallocatedBudget.toLocaleString()} Rwf
                                                            </span>
                                                        </div>
                                                        {unallocatedBudget < req.totalRequestedRwf && (
                                                            <span className="flex items-center gap-1 text-red-500 text-[10px] font-semibold">
                                                                <AlertCircle size={11} /> Exceeds budget!
                                                            </span>
                                                        )}
                                                    </div>

                                                    {isPending && cycleStatus !== 'Completed' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleRejectRequest(req.id)}
                                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-400 transition-all"
                                                            >
                                                                <ThumbsDown size={13} /> Reject
                                                            </button>
                                                            <button
                                                                onClick={() => handleApproveRequest(req.id)}
                                                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md shadow-green-900/10 transition-all active:scale-[0.98]"
                                                            >
                                                                <ThumbsUp size={13} /> Approve
                                                            </button>
                                                        </div>
                                                    )}

                                                    {isApproved && (
                                                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-bold">
                                                            <CheckCircle2 size={14} /> Approved — tasks added to FM checklist
                                                        </div>
                                                    )}
                                                    {isRejected && (
                                                        <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold">
                                                            <AlertCircle size={14} /> Rejected
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'forecasts' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={18} className="text-gray-500" />
                                    <h3 className="font-bold text-gray-900 dark:text-white">Yield Forecasts</h3>
                                </div>
                            </div>
                            
                            {forecasts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">No Forecasts Submitted</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {forecasts.filter(f => cycle?.id === undefined || f.cycleId === cycle.id || (cycle.cycleId && cycle.cycleId.includes(f.cycleId.toString()))).map(f => (
                                        <div key={f.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${f.status === 'Verified' ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-yellow-50 text-yellow-600 border border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                                                        {f.status}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-2">Submitted: {f.submitted}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-400">Expected Harvest</p>
                                                    <p className="font-medium text-gray-800 dark:text-gray-200">{f.harvestDate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">Expected Quantity</p>
                                                    <p className="font-mono text-gray-800 dark:text-gray-200">{f.prediction.toLocaleString()} kg</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">Confidence</p>
                                                    <p className="font-medium text-gray-800 dark:text-gray-200">{f.confidence}</p>
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-400 mb-1">Notes</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600/50">
                                                    {f.notes || "No notes provided."}
                                                </p>
                                            </div>
                                            
                                            {f.status === 'Pending' && cycleStatus !== 'Completed' && (
                                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Reply Note (Optional)</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="e.g. Acknowledged. Logistics informed."
                                                            value={replyText[f.id] || ''}
                                                            onChange={(e) => setReplyText({ ...replyText, [f.id]: e.target.value })}
                                                            className="w-full mt-1 px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button 
                                                            onClick={() => {
                                                                const updated = forecasts.map(pf => pf.id === f.id ? { ...pf, status: 'Verified' as const, pmReply: replyText[f.id] } : pf);
                                                                setForecasts(updated);
                                                                saveForecasts(updated);
                                                            }}
                                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                                        >
                                                            <CheckCircle2 size={14} /> Mark as Verified
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {f.status === 'Verified' && f.pmReply && (
                                                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                                    <p className="text-xs text-gray-400 mb-1">Your Reply</p>
                                                    <p className="text-sm text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                                        {f.pmReply}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- Footer --- */}
                <div className="flex-none p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>Last updated: Just now</span>
                        <span>ID: #{cycle.id}8832</span>
                    </div>
                </div>

            </div>

            {/* Report Modal */}
            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                cycleName={cycle.crop + ' ' + cycle.season}
            />

            {/* Budget Ledger Modal */}
            <BudgetLedgerModal
                isOpen={isLedgerOpen}
                onClose={() => setIsLedgerOpen(false)}
            />

            {/* Evidence View Modal */}
            <EvidenceViewModal
                isOpen={!!selectedEvidenceTask}
                onClose={() => setSelectedEvidenceTask(null)}
                task={selectedEvidenceTask}
                onApprove={() => handleEvidenceAction(selectedEvidenceTask?.id)}
                onReject={() => handleEvidenceAction(selectedEvidenceTask?.id)}
            />

            {/* Adjust Budget Modal */}
            <AdjustBudgetModal
                isOpen={isAdjustBudgetOpen}
                onClose={() => setIsAdjustBudgetOpen(false)}
                categories={ledgerDataState.categories}
                onAdjust={(categoryName, newAllocated) => {
                    setLedgerDataState(prev => {
                        const newCategories = prev.categories.map(cat => {
                            if (cat.name === categoryName) {
                                const newVariance = newAllocated - cat.spent;
                                const newStatus = newVariance >= 0 ? 'on_track' : 'over_budget';
                                return { ...cat, allocated: newAllocated, variance: newVariance, status: newStatus };
                            }
                            return cat;
                        });
                        return { ...prev, categories: newCategories };
                    });
                    setIsAdjustBudgetOpen(false);
                }}
            />

            {/* Confirm Close Modal */}
            <ConfirmCloseModal
                isOpen={isConfirmCloseOpen}
                onClose={() => setIsConfirmCloseOpen(false)}
                onConfirm={(finalYield) => {
                    setCycleStatus('Completed');
                    setIsConfirmCloseOpen(false);
                    setActiveTab('overview');
                    if (onCloseCycle) onCloseCycle(finalYield);
                }}
            />

            {/* Field Report Details Modal */}
            <FieldReportDetailsModal
                isOpen={!!selectedFieldReport}
                onClose={() => setSelectedFieldReport(null)}
                report={selectedFieldReport}
                isReadOnly={cycleStatus === 'Completed'}
                onFlag={(reason) => {
                    setLedgerDataState(prev => ({
                        ...prev,
                        recentTransactions: prev.recentTransactions.map(tx => 
                            tx.id === selectedFieldReport?.id ? { ...tx, status: 'Flagged', pmNote: reason } : tx
                        )
                    }));
                    alert(`Flagged field report. Notification successfully dispatched to Farm Manager.\nReason: ${reason}`);
                    setSelectedFieldReport(null);
                }}
            />
        </div>,
        document.body
    );
};

function ReportModal({ isOpen, onClose, cycleName }: { isOpen: boolean; onClose: () => void; cycleName: string }) {
    if (!isOpen) return null;

    const handleDownload = (type: string) => {
        alert(`Generating ${type} Report for ${cycleName}... Download started.`);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Generate Report</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Option A: Financial Summary */}
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group">
                        <div className="flex items-start gap-4 mb-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Financial Summary</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Budget variance, expense breakdown, and ROI analysis.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 pl-14">
                            <button
                                onClick={() => handleDownload('Financial (PDF)')}
                                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5"
                            >
                                <FileText size={12} /> PDF
                            </button>
                            <button
                                onClick={() => handleDownload('Financial (CSV)')}
                                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5"
                            >
                                <FileBarChart size={12} /> CSV
                            </button>
                        </div>
                    </div>

                    {/* Option B: Compliance Audit */}
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
                        <div className="flex items-start gap-4 mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400">Compliance Audit Log</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Full task history, chemical applications, and photo evidence.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 pl-14">
                            <button
                                onClick={() => handleDownload('Compliance Audit')}
                                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5"
                            >
                                <FileText size={12} /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

function AdjustBudgetModal({ isOpen, onClose, categories, onAdjust }: { isOpen: boolean; onClose: () => void; categories: any[]; onAdjust: (cat: string, amt: number) => void }) {
    const [selectedCat, setSelectedCat] = useState(categories[0]?.name || '');
    const [amount, setAmount] = useState<number | string>('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (!isNaN(numberAmount) && selectedCat) {
            onAdjust(selectedCat, numberAmount);
            setAmount('');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Adjust Category Budget</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Category</label>
                        <select
                            value={selectedCat}
                            onChange={(e) => setSelectedCat(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                        >
                            {categories.map(cat => (
                                <option key={cat.name} value={cat.name}>{cat.name} (Current: {cat.allocated.toLocaleString()} Rwf)</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Total Allocation (Rwf)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                            placeholder="Enter new total allocated budget..."
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg transition-colors">Apply Adjustment</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

function ConfirmCloseModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: (finalYield: string) => void }) {
    const [finalYield, setFinalYield] = useState('');
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Activity size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white text-center mb-2">Close Crop Cycle?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                    This will lock the financial ledger permanently. The Farm Manager will no longer be able to submit budget requests or field reports.
                </p>
                <div className="mb-5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Final Actual Yield</label>
                    <input
                        type="text"
                        value={finalYield}
                        onChange={e => setFinalYield(e.target.value)}
                        placeholder="e.g. 4,800 kg"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition-all placeholder-gray-400 dark:text-white"
                    />
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 font-bold text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => finalYield.trim() && onConfirm(finalYield)}
                        disabled={!finalYield.trim()}
                        className="flex-1 py-2 font-bold text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

function FieldReportDetailsModal({ isOpen, onClose, report, onFlag, isReadOnly }: { isOpen: boolean; onClose: () => void; report: any; onFlag?: (reason: string) => void; isReadOnly?: boolean }) {
    const [isFlagging, setIsFlagging] = useState(false);
    const [flagReason, setFlagReason] = useState('');

    if (!isOpen || !report) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50/50 dark:bg-gray-900/30">
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                                {report.desc.replace('Field Report: ', '')}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {report.block} &nbsp;•&nbsp; Submitted: {report.date}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
                    {/* Financial Comparison */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Approved Budget</p>
                            <p className="font-mono text-lg font-bold text-gray-800 dark:text-gray-200">
                                {report.approvedAmount ? report.approvedAmount.toLocaleString() : 'N/A'} Rwf
                            </p>
                        </div>
                        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-900/20">
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase mb-1">Actual Cost</p>
                            <p className="font-mono text-lg font-bold text-emerald-800 dark:text-emerald-300">
                                {report.amount.toLocaleString()} Rwf
                            </p>
                        </div>
                    </div>

                    {/* Notes */}
                    {report.notes && (
                        <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Field Notes</p>
                            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 text-blue-800 dark:text-blue-300 text-sm leading-relaxed">
                                "{report.notes}"
                            </div>
                        </div>
                    )}

                    {/* Proof of Work */}
                    <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                            <Image size={16} /> Proof of Work
                        </p>
                        {report.hasProof ? (
                            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img src="https://images.unsplash.com/photo-1625246333195-58197bd47d26?auto=format&fit=crop&q=80&w=800&h=400" alt="Proof of Work" className="w-full h-48 object-cover" />
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500">
                                    <span>Verified automatically</span>
                                    <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Image Attached</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-gray-900/30">
                                <Image size={24} className="mb-2 opacity-50" />
                                <p className="text-sm">No photo evidence uploaded.</p>
                            </div>
                        )}
                    </div>

                    {/* Action Bar */}
                    {!isReadOnly && (
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                        {report.status === 'Flagged' ? (
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl text-amber-800 dark:text-amber-300 text-sm font-semibold flex items-center justify-center gap-2">
                                <AlertCircle size={16} /> This report has been flagged for review.
                            </div>
                        ) : !isFlagging ? (
                            <button
                                onClick={() => setIsFlagging(true)}
                                className="w-full py-3 rounded-xl border-2 border-amber-500 text-amber-600 dark:text-amber-500 font-bold text-sm hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
                            >
                                Flag for Review
                            </button>
                        ) : (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                    Reason for Flagging <span className="text-gray-400 font-normal">(This will be sent to the Farm Manager)</span>
                                </label>
                                <textarea
                                    value={flagReason}
                                    onChange={(e) => setFlagReason(e.target.value)}
                                    placeholder="Explain what is missing, unclear, or incorrect..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-gray-900 dark:text-white resize-none h-24"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsFlagging(false)}
                                        className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 font-semibold text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (onFlag && flagReason.trim()) {
                                                onFlag(flagReason);
                                                setIsFlagging(false);
                                                setFlagReason('');
                                            }
                                        }}
                                        disabled={!flagReason.trim()}
                                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Submit Flag
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

export default CropCycleDetailModal;
