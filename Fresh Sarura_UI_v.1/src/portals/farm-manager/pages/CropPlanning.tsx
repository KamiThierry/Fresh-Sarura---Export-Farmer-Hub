import { useState } from 'react';
import {
    Sprout, AlertTriangle, CheckCircle2,
    Plus, Leaf, Coins, Camera,
    Clock, ScrollText,
    ChevronRight
} from 'lucide-react';
import TaskExecutionModal from '../components/TaskExecutionModal';
import BudgetActivityRequestModal from '../components/BudgetActivityRequestModal';
import FMActivityLogModal from '../components/FMActivityLogModal';
import type { Task, BudgetRequest, ActivityLineItem } from '../../shared/types/activity';

interface CropCycle {
    id: number;
    crop: string;
    variety: string;
    season: string;
    stage: 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvest';
    status?: 'Active' | 'Harvesting' | 'Completed';
    budgetUsed: number;
    targetYield: string;
    nextMilestone: string;
    tasks: Task[];
}

// --- Mock Data ---
const MOCK_CYCLES: CropCycle[] = [
    {
        id: 1,
        crop: 'Avocado',
        variety: 'Hass',
        season: 'Season A 2026',
        stage: 'Fruiting',
        status: 'Active',
        budgetUsed: 65,
        targetYield: '5,000 kg',
        nextMilestone: 'Fertilizer Application (Due Oct 15)',
        tasks: [
            {
                id: 101,
                title: 'Pruning maintenance',
                date: 'Oct 10',
                completed: true,
                proofRequired: true,
                block: 'Block A3',
                startDate: 'Oct 8, 2026',
                endDate: 'Oct 10, 2026',
                approvedBudgetRwf: 35000,
                actualCostRwf: 33500,
                statusDate: 'Oct 10, 2026',
                fieldNote: 'Completed on schedule. All branches cleaned without issues.',
                approvalStatus: 'Approved' as const,
            },
            {
                id: 102,
                title: 'Apply NPK Fertilizer',
                date: 'Oct 15',
                completed: false,
                proofRequired: true,
                block: 'Block B1',
                startDate: 'Oct 15, 2026',
                endDate: 'Oct 17, 2026',
                approvedBudgetRwf: 72000,
                approvalStatus: 'Approved' as const,
            },
            {
                id: 103,
                title: 'Pest Scouting',
                date: 'Oct 18',
                completed: false,
                proofRequired: false,
                block: 'Block A3',
                startDate: 'Oct 18, 2026',
                endDate: 'Oct 18, 2026',
                approvedBudgetRwf: 15000,
                approvalStatus: 'Approved' as const,
            },
            {
                id: 104,
                title: 'Drip Irrigation Extension',
                date: 'Oct 5',
                completed: false,
                proofRequired: false,
                block: 'Block B2',
                estimatedCostRwf: 180000,
                statusDate: 'Oct 4, 2026',
                pmNote: 'Budget exceeded category limit. Please revise to under 120,000 Rwf and resubmit.',
                approvalStatus: 'Rejected' as const,
            },
            {
                id: 105,
                title: 'Weed Control - Manual',
                date: 'Oct 18',
                completed: false,
                proofRequired: true,
                block: 'Block B1',
                startDate: 'Oct 18, 2026',
                endDate: 'Oct 19, 2026',
                approvedBudgetRwf: 22000,
                actualCostRwf: 45000,
                statusDate: 'Oct 19, 2026',
                pmNote: 'Actual cost is double the approved budget and no photo evidence was provided. Please explain in notes and upload proof.',
                approvalStatus: 'Flagged' as const,
            },
        ],
    },
    {
        id: 2,
        crop: 'Chili',
        variety: 'Bird Eye',
        season: 'Season B 2026',
        stage: 'Flowering',
        status: 'Completed',
        budgetUsed: 92,
        targetYield: '1,200 kg',
        nextMilestone: 'Pest Control Spray',
        tasks: [
            {
                id: 201,
                title: 'Weeding Channel A',
                date: 'Oct 12',
                completed: true,
                proofRequired: false,
                block: 'Block C2',
                startDate: 'Oct 11, 2026',
                endDate: 'Oct 12, 2026',
                approvedBudgetRwf: 20000,
                actualCostRwf: 20000,
                statusDate: 'Oct 12, 2026',
                fieldNote: 'Completed on time. Soil was dry, work was faster than estimated.',
                approvalStatus: 'Approved' as const,
            },
            {
                id: 202,
                title: 'Irrigation Check',
                date: 'Oct 13',
                completed: true,
                proofRequired: true,
                block: 'Block C1',
                startDate: 'Oct 13, 2026',
                endDate: 'Oct 13, 2026',
                approvedBudgetRwf: 10000,
                actualCostRwf: 12500,
                statusDate: 'Oct 13, 2026',
                fieldNote: 'Delayed 1 day due to heavy rain. One drip line replaced — cost went slightly over estimate.',
                approvalStatus: 'Approved' as const,
            },
            {
                id: 203,
                title: 'Fungal Spray',
                date: 'Oct 14',
                completed: false,
                proofRequired: true,
                block: 'Block C2',
                startDate: 'Oct 14, 2026',
                endDate: 'Oct 14, 2026',
                approvedBudgetRwf: 48000,
                approvalStatus: 'Approved' as const,
            },
            {
                id: 204,
                title: 'Shade Net Installation',
                date: 'Oct 9',
                completed: false,
                proofRequired: false,
                block: 'Block C1',
                estimatedCostRwf: 95000,
                statusDate: 'Oct 9, 2026',
                pmNote: 'Not approved this season — shade nets are not in the approved input plan. Discuss at next review.',
                approvalStatus: 'Rejected' as const,
            },
        ],
    },
];


// ─── Main Page ────────────────────────────────────────────────────────────────

const CropPlanning = () => {
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedCycle, setSelectedCycle] = useState<CropCycle | null>(null);

    // Pending requests keyed by cycleId (submitted, awaiting PM approval)
    const [pendingRequestsByCycle, setPendingRequestsByCycle] = useState<Record<number, BudgetRequest[]>>({});

    // PM-approved extra tasks keyed by cycleId
    const [approvedTasksByCycle, setApprovedTasksByCycle] = useState<Record<number, Task[]>>({});

    // Task Execution
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Activity Log
    const [logCycle, setLogCycle] = useState<CropCycle | null>(null);

    const handleRequestClick = (cycle: CropCycle) => {
        setSelectedCycle(cycle);
        setIsRequestModalOpen(true);
    };

    const handleTaskClick = (task: Task) => {
        if (!task.completed) setSelectedTask(task);
    };

    const handleTaskComplete = (taskId: number, notes: string, hasProof: boolean, actualCostRwf: number | null) => {
        console.log(`Field report — Task: ${taskId}, Notes: ${notes}, Proof: ${hasProof}, Cost: ${actualCostRwf ?? 'N/A'} Rwf`);
        alert('Field report submitted successfully!');
        setSelectedTask(null);
    };

    const handleBudgetRequestSubmit = (request: BudgetRequest) => {
        // Persist the pending request so the FM can see it in the "Pending Requests" tab
        setPendingRequestsByCycle(prev => ({
            ...prev,
            [request.cycleId]: [...(prev[request.cycleId] ?? []), request],
        }));
        setIsRequestModalOpen(false);
        setSelectedCycle(null);
    };

    // Called when PM approves (future integration point)
    const handleRequestApproved = (cycleId: number, newTasks: Task[]) => {
        setApprovedTasksByCycle(prev => ({
            ...prev,
            [cycleId]: [...(prev[cycleId] ?? []), ...newTasks],
        }));
    };

    return (
        <div className="p-4 md:p-6 pb-24 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Sprout className="text-green-600" />
                        My Active Crop Cycles
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your active blocks, track approved budgets, and log field operations.
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            {MOCK_CYCLES.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {MOCK_CYCLES.map(cycle => (
                        <CycleCard
                            key={cycle.id}
                            cycle={cycle}
                            extraTasks={approvedTasksByCycle[cycle.id] ?? []}
                            pendingRequests={pendingRequestsByCycle[cycle.id] ?? []}
                            onRequestInput={() => handleRequestClick(cycle)}
                            onTaskClick={handleTaskClick}
                            onViewLog={() => setLogCycle(cycle)}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState />
            )}

            {/* Budget & Activity Request Modal */}
            {isRequestModalOpen && selectedCycle && (
                <BudgetActivityRequestModal
                    isOpen={isRequestModalOpen}
                    onClose={() => { setIsRequestModalOpen(false); setSelectedCycle(null); }}
                    cycleId={selectedCycle.id}
                    cycleName={`${selectedCycle.crop} (${selectedCycle.variety}) — ${selectedCycle.season}`}
                    onSubmit={handleBudgetRequestSubmit}
                />
            )}

            {/* Task Execution Modal */}
            {selectedTask && (
                <TaskExecutionModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onComplete={handleTaskComplete}
                />
            )}

            {/* Activity Log Modal */}
            {logCycle && (
                <FMActivityLogModal
                    cycleName={`${logCycle.crop} (${logCycle.variety}) — ${logCycle.season}`}
                    tasks={[...logCycle.tasks, ...(approvedTasksByCycle[logCycle.id] ?? [])]}
                    onClose={() => setLogCycle(null)}
                    onResubmit={(task) => {
                        setLogCycle(null);
                        setSelectedTask(task);
                    }}
                />
            )}

            {/* Integration binding point for PM approval */}
            <span className="hidden" data-on-approved={String(!!handleRequestApproved)} />
        </div>
    );
};

// ─── CycleCard ────────────────────────────────────────────────────────────────

type CardTab = 'plan' | 'pending';

interface CycleCardProps {
    cycle: CropCycle;
    extraTasks: Task[];
    pendingRequests: BudgetRequest[];
    onRequestInput: () => void;
    onTaskClick: (task: Task) => void;
    onViewLog: () => void;
}

const CycleCard = ({ cycle, extraTasks, pendingRequests, onRequestInput, onTaskClick, onViewLog }: CycleCardProps) => {
    const [activeTab, setActiveTab] = useState<CardTab>('plan');

    const getBudgetColor = (p: number) => p > 90 ? 'bg-red-500' : p > 75 ? 'bg-orange-400' : 'bg-green-500';
    const getBudgetTextColor = (p: number) => p > 90 ? 'text-red-600' : p > 75 ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400';

    // Flatten pending line items for display
    const pendingItems: (ActivityLineItem & { submittedAt: string })[] = pendingRequests.flatMap(r =>
        r.lineItems.map(li => ({ ...li, submittedAt: r.submittedAt }))
    );

    const pendingCount = pendingItems.length;

    // Approved tasks = original cycle tasks + PM-dropped-in extras (all Approved)
    const approvedTasks = [...cycle.tasks, ...extraTasks].filter(
        t => !t.approvalStatus || t.approvalStatus === 'Approved'
    );

    const fmtRwf = (n: number) => `${n.toLocaleString()} Rwf`;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">

            {/* Card Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50/50 dark:bg-gray-700/20">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{cycle.crop}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            cycle.status === 'Harvesting' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                            cycle.status === 'Completed' ? 'bg-gray-100 text-gray-500' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                            {cycle.status === 'Completed' ? 'Closed' : cycle.status === 'Harvesting' ? 'Harvesting' : cycle.stage}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {cycle.variety} • {cycle.season}
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-600 flex items-center justify-center shadow-sm">
                    <Leaf size={20} className="text-green-600" />
                </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5 flex-1">

                {/* 1. Budget Bar */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <Coins size={14} className="text-gray-400" />
                            Budget Usage
                        </span>
                        <span className={`text-xs font-bold ${getBudgetTextColor(cycle.budgetUsed)}`}>
                            {cycle.budgetUsed}% Used
                        </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${getBudgetColor(cycle.budgetUsed)}`}
                            style={{ width: `${cycle.budgetUsed}%` }}
                        />
                    </div>
                    {cycle.budgetUsed > 90 && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertTriangle size={10} />
                            Critical: Budget nearly exhausted.
                        </p>
                    )}
                </div>

                {/* 2. Key Details */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Target Yield</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{cycle.targetYield}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Next Milestone</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-1">{cycle.nextMilestone}</p>
                    </div>
                </div>

                {/* 3. Tabbed Task Section */}
                <div>
                    {/* Tab bar */}
                    <div className="flex items-center gap-1 border-b border-gray-100 dark:border-gray-700 mb-3">
                        <button
                            onClick={() => setActiveTab('plan')}
                            className={`relative pb-2 px-1 text-xs font-bold transition-colors ${
                                activeTab === 'plan'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            Action Plan
                            {activeTab === 'plan' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-500" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`relative pb-2 px-1 text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                activeTab === 'pending'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            Pending Requests
                            {pendingCount > 0 && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                    activeTab === 'pending'
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                    {pendingCount}
                                </span>
                            )}
                            {activeTab === 'pending' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-amber-500" />
                            )}
                        </button>
                    </div>

                    {/* ── Action Plan Tab ── */}
                    {activeTab === 'plan' && (
                        <div className="space-y-1">
                            {approvedTasks.length === 0 ? (
                                <p className="text-xs text-gray-400 italic text-center py-3">No approved activities yet.</p>
                            ) : (
                                approvedTasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => {
                                            if (cycle.status !== 'Completed') onTaskClick(task);
                                        }}
                                        className={`flex items-center gap-3 py-2 px-2 rounded-lg transition-all border border-transparent ${
                                            task.completed || cycle.status === 'Completed'
                                                ? 'opacity-60 cursor-default'
                                                : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-100 dark:hover:border-gray-600 active:scale-[0.99] group'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                            task.completed
                                                ? 'bg-green-500 border-green-500'
                                                : cycle.status === 'Completed' ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800' : 'border-gray-300 dark:border-gray-600 group-hover:border-emerald-500'
                                        }`}>
                                            {task.completed && <CheckCircle2 size={10} className="text-white" />}
                                        </div>
                                        <span className={`text-xs flex-1 truncate ${
                                            task.completed
                                                ? 'text-gray-400 line-through'
                                                : cycle.status === 'Completed' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                                        }`}>
                                            {task.title}
                                        </span>
                                        {task.proofRequired && !task.completed && cycle.status !== 'Completed' && (
                                            <Camera size={12} className="text-gray-400 group-hover:text-emerald-500 shrink-0" />
                                        )}
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap ${
                                            task.completed
                                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                                : cycle.status === 'Completed' ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-700'
                                        }`}>
                                            {task.date}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── Pending Requests Tab ── */}
                    {activeTab === 'pending' && (
                        <div className="space-y-1.5">
                            {pendingItems.length === 0 ? (
                                <div className="text-center py-5">
                                    <p className="text-xs text-gray-400 italic">No pending requests for this cycle.</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Use "Request Inputs / Funds" to submit activities.</p>
                                </div>
                            ) : (
                                pendingItems.map((item, idx) => (
                                    <div
                                        key={`${item.id}-${idx}`}
                                        className="flex items-center gap-3 py-2 px-2 rounded-lg border border-amber-100 dark:border-amber-900/20 bg-amber-50/50 dark:bg-amber-900/5"
                                    >
                                        {/* No checkbox — can't execute yet */}
                                        <div className="w-4 h-4 rounded border border-dashed border-amber-300 dark:border-amber-700 shrink-0" />

                                        <span className="text-xs flex-1 truncate text-gray-700 dark:text-gray-300">
                                            {item.activityName}
                                        </span>

                                        {/* Estimated cost */}
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono">
                                            {fmtRwf(item.estimatedCostRwf)}
                                        </span>

                                        {/* Status badge */}
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap shrink-0">
                                            <Clock size={8} />
                                            Pending PM
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Action */}
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
                {/* Activity Log link */}
                <button
                    onClick={onViewLog}
                    className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1"
                >
                    <ScrollText size={12} />
                    View Activity Log
                    <ChevronRight size={11} />
                </button>

                {/* Request button */}
                {cycle.status !== 'Completed' && (
                    <button
                        onClick={onRequestInput}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Request Inputs / Funds
                    </button>
                )}
            </div>
        </div>
    );
};


// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Sprout size={40} className="text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">No active crop cycles</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            You don't have any assigned crops for this season. Contact HQ to start a new season plan.
        </p>
    </div>
);

export default CropPlanning;
