import { useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/lib/api';
import { Sprout, Plus, AlertTriangle, ChevronRight, BarChart2, AlertCircle, CheckCircle2 } from 'lucide-react';
import CreateCropCycleModal from '../components/CreateCropCycleModal';
import CropCycleDetailModal from '../components/CropCycleDetailModal';
import BudgetRejectionModal from '../components/BudgetRejectionModal';
import Toast from '../../shared/component/Toast';
import { usePMContext } from '@/context/PMContext';

const CropPlanning = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCycle, setSelectedCycle] = useState<any>(null);
    const [toast, setToast] = useState<{ message: string; subtitle?: string } | null>(null);
    const [initialTab, setInitialTab] = useState<'overview' | 'financials' | 'requests' | 'forecasts'>('overview');
    const [rejectionModalConfig, setRejectionModalConfig] = useState<{ isOpen: boolean; requestId: string | null }>({
        isOpen: false,
        requestId: null,
    });
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [overdraftWarning, setOverdraftWarning] = useState<any>(null); // { requestId, details }
    const [initialAdjust, setInitialAdjust] = useState(false);

    const { 
        cycles, 
        pendingRequests, 
        pendingForecasts,
        pendingReports,
        loading, 
        refreshCycles, 
        refreshPendingRequests,
        refreshPendingForecasts,
        refreshPendingReports 
    } = usePMContext();
    
    // Split cycles into active/harvesting and completed
    const activeCycles = cycles.filter((c: any) => c.status !== 'completed');
    const completedCycles = cycles.filter((c: any) => c.status === 'completed');

    const handleApproveRequest = async (requestId: string, forceApprove = false) => {
        try {
            await api.patch(`/crop-cycles/budget-requests/${requestId}/approve`, { forceApprove, pmNote: 'Approved' });
            setToast({ message: 'Request Approved', subtitle: 'The budget allocation has been updated.' });
            setOverdraftWarning(null);
            refreshPendingRequests();
            refreshCycles();
        } catch (err: any) {
            if (err.code === 'BUDGET_OVERDRAFT') {
                setOverdraftWarning({ requestId, details: err.overdraftDetails });
            } else {
                console.error('Failed to approve request:', err);
                setToast({ message: 'Error', subtitle: err.message || 'Failed to approve request.' });
            }
        }
    };

    const handleConfirmRejection = async (requestId: string, pmNote: string) => {
        try {
            await api.patch(`/crop-cycles/budget-requests/${requestId}/reject`, { pmNote });
            setToast({ message: 'Request Rejected' });
            refreshPendingRequests();
        } catch (err) {
            console.error('Failed to reject request:', err);
            setToast({ message: 'Error', subtitle: 'Failed to reject request.' });
        }
    };

    const handleRejectRequest = (requestId: string) => {
        setRejectionModalConfig({ isOpen: true, requestId });
    };

    const calculateProgress = (spent: number, total: number) => {
        const percentage = (spent / total) * 100;
        return Math.min(percentage, 100);
    };

    const handleCloseCycle = async (cycleId: string, finalYield: string) => {
        try {
            await api.patch(`/crop-cycles/${cycleId}`, {
                status: 'completed',
                final_yield: finalYield,
            });
            refreshCycles();
            setSelectedCycle(null);
            setToast({ message: 'Crop Cycle Closed', subtitle: `Final yield recorded: ${finalYield}` });
        } catch (err) {
            console.error('Failed to close cycle:', err);
            setToast({ message: 'Error', subtitle: 'Failed to close the cycle. Please try again.' });
        }
    };

    const handleOpenDetail = (cycle: any) => {
        setSelectedCycle({
            ...cycle,
            id: cycle._id,
            cycleId: cycle.cycleId ?? cycle._id,
            crop: cycle.crop_name,
            landSize: `${cycle.block_size_hectares ?? '—'} Ha`,
            startDate: cycle.start_date ? new Date(cycle.start_date).toLocaleDateString() : '—',
            endDate: cycle.expected_harvest_date ? new Date(cycle.expected_harvest_date).toLocaleDateString() : '—',
            budget: cycle.total_budget,
            spent: cycle.spent ?? 0,
            yieldGoal: cycle.yield_goal_kg != null ? `${cycle.yield_goal_kg.toLocaleString()} kg` : '—',
        });
    };

    return (
        <div className="space-y-8 pb-20">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Crop Planning & Budget Oversight</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Allocate farm budgets and monitor spending variances.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20 font-medium"
                >
                    <Plus size={20} />
                    Start New Crop Cycle
                </button>
            </div>

            {/* Derived data for flags */}
            {(() => {
                const unreadRequests = pendingRequests.filter((r: any) => !r.isReadByPM);
                const unreadForecasts = pendingForecasts.filter((f: any) => !f.isReadByPM);
                const unreadReports = pendingReports.filter((r: any) => !r.isReadByPM);
                const hasActions = unreadRequests.length > 0 || unreadForecasts.length > 0 || unreadReports.length > 0;

                if (!hasActions) return null;

                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">Action Required: Pending Reviews</h3>
                        </div>

                        {/* Budget Alerts */}
                        <div className="space-y-4">
                            {unreadRequests.map((request) => {
                                const primaryCategory = request.lineItems?.[0]?.category || 'General';
                                const cycleCat = request.cycle_budget_categories?.find((c: any) => c.name === primaryCategory) || { allocated: 0, spent: 0 };
                                const amount = request.totalRequestedRwf;
                                const limit = Math.max(0, cycleCat.allocated - cycleCat.spent);
                                const isOverdraft = amount > limit;

                                return (
                                    <div 
                                        key={request._id} 
                                        className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-l-4 ${isOverdraft ? 'border-red-500' : 'border-amber-400'} shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow group/card`}
                                        onClick={async (e) => {
                                            if ((e.target as HTMLElement).closest('button')) return;
                                            try { await api.patch(`/crop-cycles/budget-requests/${request._id}/read`, {}); } catch (err) { console.error(err); }
                                            refreshPendingRequests();
                                            setSelectedItemId(request._id);
                                            setInitialTab('requests');
                                            const cycle = cycles.find(c => c._id === request.cycleId);
                                            if (cycle) handleOpenDetail(cycle);
                                        }}
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-10 transition-opacity">
                                            <AlertTriangle size={80} />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                            {request.farm_name}
                                                        </span>
                                                        <span className="text-xs text-gray-400">• Budget Request</span>
                                                    </div>
                                                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                                        {isOverdraft ? '⚠️ Budget Overdraft Request' : '⏳ Pending Budget Request'} from {request.submittedByName}
                                                    </h2>
                                                    <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                                                        Requesting <strong>{amount.toLocaleString()} Rwf</strong> for {primaryCategory}.
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleRejectRequest(request._id)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">Reject</button>
                                                    <button onClick={() => handleApproveRequest(request._id)} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors">Approve</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Yield Forecast Alerts */}
                            {unreadForecasts.map((forecast) => {
                                const cycle = cycles.find(c => c._id === forecast.cycleId);
                                return (
                                    <div 
                                        key={forecast._id} 
                                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-l-4 border-blue-500 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow group/card"
                                        onClick={async () => {
                                            try { await api.patch(`/crop-cycles/yield-forecasts/${forecast._id}/read`, {}); } catch (err) { console.error(err); }
                                            refreshPendingForecasts();
                                            setSelectedItemId(forecast._id);
                                            setInitialTab('forecasts');
                                            if (cycle) handleOpenDetail(cycle);
                                        }}
                                    >
                                        <div className="relative z-10 flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                                        {cycle?.farm_name || 'Farm'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">• Yield Forecast</span>
                                                </div>
                                                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                                    New Yield Prediction: {forecast.predictionKg?.toLocaleString()} kg
                                                </h2>
                                                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                                                    Expected Harvest: {new Date(forecast.harvestDate).toLocaleDateString()} • {forecast.confidence} Confidence
                                                </p>
                                            </div>
                                            <button className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Field Report Alerts */}
                            {unreadReports.map((report) => {
                                const cycle = cycles.find(c => c._id === report.cycleId);
                                return (
                                    <div 
                                        key={report._id} 
                                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-l-4 border-emerald-500 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow group/card"
                                        onClick={async () => {
                                            try { await api.patch(`/crop-cycles/field-reports/${report._id}/read`, {}); } catch (err) { console.error(err); }
                                            refreshPendingReports();
                                            setSelectedItemId(report._id);
                                            setInitialTab('overview');
                                            if (cycle) handleOpenDetail(cycle);
                                        }}
                                    >
                                        <div className="relative z-10 flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                                        {cycle?.farm_name || 'Farm'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">• Field Report</span>
                                                </div>
                                                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                                    New Report: {report.description}
                                                </h2>
                                                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                                                    Actual Cost: {report.actualCostRwf?.toLocaleString()} Rwf • {report.category}
                                                </p>
                                            </div>
                                            <button className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* Section 2: Active Crop Cycles (The Dashboard Grid) */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Active Crop Cycles</h3>

                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm py-4">Loading crop cycles...</p>
                ) : activeCycles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 dark:bg-gray-800/10 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <Sprout size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="font-semibold text-gray-500 dark:text-gray-400">No active crop cycles.</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Start New Crop Cycle" above to create your first one.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeCycles.map((cycle) => (
                            <CycleCard 
                                key={cycle._id} 
                                cycle={cycle} 
                                onSelect={() => {
                                    setInitialTab('overview');
                                    handleOpenDetail(cycle);
                                }}
                                calculateProgress={calculateProgress}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Section 3: Completed Crop Cycles (History) */}
            {!loading && completedCycles.length > 0 && (
                <div className="pt-8 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Completed Crop Cycles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                        {completedCycles.map((cycle) => (
                            <CycleCard 
                                key={cycle._id} 
                                cycle={cycle} 
                                onSelect={() => {
                                    setInitialTab('overview');
                                    handleOpenDetail(cycle);
                                }}
                                calculateProgress={calculateProgress}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    subtitle={toast.subtitle}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Modal 1: Create Cycle */}
            <CreateCropCycleModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={async (formData) => {
                    try {
                        await api.post('/crop-cycles', formData);
                        setIsCreateModalOpen(false);
                        refreshCycles();
                        setToast({ message: 'Crop Cycle Created!', subtitle: `${formData.crop_name} cycle is now active.` });
                    } catch (err) {
                        console.error('Failed to create cycle:', err);
                        setToast({ message: 'Error', subtitle: 'Failed to create the crop cycle. Please try again.' });
                    }
                }}
            />

            {/* Modal 2: Cycle Details */}
            {selectedCycle && (
                <CropCycleDetailModal 
                    isOpen={selectedCycle !== null} 
                    onClose={() => {
                        setSelectedCycle(null);
                        setSelectedItemId(null);
                        setInitialAdjust(false);
                    }} 
                    cycle={selectedCycle} 
                    initialTab={initialTab}
                    initialItemId={selectedItemId}
                    initialAdjust={initialAdjust}
                    onCloseCycle={(finalYield) => handleCloseCycle(selectedCycle._id, finalYield)}
                />
            )}

            {/* Modal 3: Rejection Feedback */}
            <BudgetRejectionModal
                isOpen={rejectionModalConfig.isOpen}
                onClose={() => setRejectionModalConfig({ isOpen: false, requestId: null })}
                requestId={rejectionModalConfig.requestId}
                onConfirm={handleConfirmRejection}
            />

            <OverdraftWarningModal
                isOpen={!!overdraftWarning}
                onClose={() => setOverdraftWarning(null)}
                details={overdraftWarning?.details || []}
                onConfirm={() => handleApproveRequest(overdraftWarning.requestId, true)}
                onAdjust={() => {
                    const req = pendingRequests.find((r: any) => r._id === overdraftWarning.requestId);
                    const cycleToOpen = cycles.find((c: any) => c._id === req?.cycleId);
                    if (cycleToOpen) {
                        setOverdraftWarning(null);
                        setInitialAdjust(true);
                        setInitialTab('requests'); // Switch to requests tab immediately
                        setSelectedItemId(overdraftWarning.requestId); // Focus on the request
                        handleOpenDetail(cycleToOpen);
                    } else {
                        setOverdraftWarning(null);
                    }
                }}
            />
        </div>
    );
};

// ── Local Component: CycleCard ──────────────────────────────────────────
const CycleCard = ({ cycle, onSelect, calculateProgress }: { cycle: any, onSelect: () => void, calculateProgress: any }) => {
    const spent = cycle.spent ?? 0;
    const total = cycle.total_budget ?? 0;
    const approved = cycle.approved ?? 0;
    const progress = cycle.status === 'completed' || cycle.status === 'harvesting'
        ? 100
        : calculateProgress(approved, total);
    
    const statusLabel = cycle.status === 'active' ? '● Active'
        : cycle.status === 'harvesting' ? '◉ Harvesting'
        : cycle.status === 'completed' ? '✓ Completed'
        : cycle.status;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{cycle.farm_name ?? cycle.block_name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            {cycle.season}
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Sprout size={20} className="text-green-500" />
                        {cycle.crop_name}
                    </h4>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cycle.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'}`}>
                    <BarChart2 size={16} />
                </div>
            </div>

            {/* Status badge */}
            <div className="mb-3">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    cycle.status === 'harvesting' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse' :
                    cycle.status === 'completed' ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                    {statusLabel}
                </span>
            </div>

            {/* Cycle Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-gray-500">Cycle Progress</span>
                    <span className={`text-sm font-bold ${progress >= 90 ? 'text-amber-600' : 'text-green-600'}`}>
                        {Math.round(progress)}% Approved
                    </span>
                </div>
                <div className="relative h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                            cycle.status === 'harvesting' ? 'bg-amber-500' :
                            cycle.status === 'completed' ? 'bg-gray-400' :
                            progress >= 90 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1 text-[10px] font-mono text-gray-400">
                    <span>{approved.toLocaleString()} approved</span>
                    <span>{total.toLocaleString()} total</span>
                </div>
            </div>

            {/* Footer Action */}
            <button
                onClick={onSelect}
                className="w-full py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors"
            >
                Manage Cycle <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default CropPlanning;

const OverdraftWarningModal = ({
    isOpen, onClose, details, onConfirm, onAdjust
}: {
    isOpen: boolean;
    onClose: () => void;
    details: any[];
    onConfirm: () => void;
    onAdjust: () => void;
}) => {
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-red-100 dark:border-red-900/30 animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-6 py-5 bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-red-800 dark:text-red-400">Budget Overdraft!</h3>
                        <p className="text-xs text-red-600 dark:text-red-500 font-medium">This request exceeds the category limits.</p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="space-y-4 mb-6">
                        {details.map((d, i) => (
                            <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{d.category}</span>
                                    <span className="text-xs font-mono font-bold text-red-600">+{d.excess.toLocaleString()} Rwf</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                                    <span>Remaining: {d.remaining.toLocaleString()} Rwf</span>
                                    <span>Requested: {d.requested.toLocaleString()} Rwf</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                        You can either adjust the allocated budget for these categories first, or force-approve this request anyway.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            className="w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            Approve Anyway
                        </button>
                        <button
                            onClick={onAdjust}
                            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors shadow-lg shadow-red-900/20"
                        >
                            Adjust Budget First
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
