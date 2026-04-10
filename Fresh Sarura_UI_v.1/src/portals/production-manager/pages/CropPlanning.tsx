import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sprout, Plus, AlertTriangle, ChevronRight, BarChart2 } from 'lucide-react';
import CreateCropCycleModal from '../components/CreateCropCycleModal';
import CropCycleDetailModal from '../components/CropCycleDetailModal';
import Toast from '../../shared/component/Toast';

const CropPlanning = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCycle, setSelectedCycle] = useState<any>(null);
    const [cycles, setCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; subtitle?: string } | null>(null);

    const fetchCycles = async () => {
        setLoading(true);
        try {
            const res = await api.get('/crop-cycles');
            setCycles(res.data.data ?? res.data);
        } catch (err) {
            console.error('Failed to fetch crop cycles:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCycles();
    }, []);

    // Mock Data for "Priority Zone" Alert
    const budgetAlert = {
        exists: true,
        farm: 'Kayonza Farm',
        amount: 500000,
        category: 'Labor',
        limit: 50000,
        allocated: 1000000,
        spent: 950000,
        requester: 'Jean Claude (Site Manager)'
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
            fetchCycles();
            setSelectedCycle(null);
            setToast({ message: 'Crop Cycle Closed', subtitle: `Final yield recorded: ${finalYield}` });
        } catch (err) {
            console.error('Failed to close cycle:', err);
            setToast({ message: 'Error', subtitle: 'Failed to close the cycle. Please try again.' });
        }
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

            {/* Section 1: The "Priority Action" Zone - Budget Alerts */}
            {budgetAlert.exists && (
                <div className="animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">Action Required: Budget Approvals</h3>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-l-4 border-red-500 shadow-sm relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <AlertTriangle size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                            {budgetAlert.farm}
                                        </span>
                                        <span className="text-xs text-gray-400">• Just Now</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        ⚠️ Budget Overdraft Request from {budgetAlert.requester}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm leading-relaxed max-w-2xl">
                                        Requesting <strong className="text-gray-900 dark:text-white">{budgetAlert.amount.toLocaleString()} Rwf</strong> for <span className="underline decoration-red-300 decoration-2 underline-offset-2">{budgetAlert.category}</span>.
                                        This exceeds the remaining category limit of <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{budgetAlert.limit.toLocaleString()} Rwf</span>.
                                    </p>

                                    {/* Context Stats */}
                                    <div className="flex items-center gap-6 mt-4 text-xs font-mono text-gray-500">
                                        <div>
                                            <span className="block text-[10px] uppercase text-gray-400 mb-0.5">Allocated</span>
                                            <span className="font-bold">{budgetAlert.allocated.toLocaleString()}</span>
                                        </div>
                                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                                        <div>
                                            <span className="block text-[10px] uppercase text-gray-400 mb-0.5">Spent So Far</span>
                                            <span className="font-bold">{budgetAlert.spent.toLocaleString()}</span>
                                        </div>
                                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                                        <div>
                                            <span className="block text-[10px] uppercase text-gray-400 mb-0.5">New Projected</span>
                                            <span className="font-bold text-red-500">{(budgetAlert.spent + budgetAlert.amount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 mt-2 md:mt-0">
                                    <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        Reject Request
                                    </button>
                                    <button className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20">
                                        Approve Override
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Section 2: Active Crop Cycles (The Dashboard Grid) */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Active Crop Cycles</h3>

                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm py-4">Loading crop cycles...</p>
                ) : cycles.length === 0 ? (
                    <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
                        <Sprout size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="font-semibold text-gray-500 dark:text-gray-400">No crop cycles yet.</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Start New Crop Cycle" above to create your first one.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cycles.map((cycle) => {
                            const spent = cycle.spent ?? 0;
                            const total = cycle.total_budget ?? 0;
                            const varianceVal = spent - total;
                            const isOver = varianceVal > 0;
                            const progress = cycle.status === 'completed' || cycle.status === 'harvesting'
                                ? 100
                                : calculateProgress(spent, total);
                            const statusLabel = cycle.status === 'active' ? '● Active'
                                : cycle.status === 'harvesting' ? '◉ Harvesting'
                                : cycle.status === 'completed' ? '✓ Completed'
                                : cycle.status;

                            return (
                                <div key={cycle._id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">

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
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOver ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
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

                                    {/* Budget Variance */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-medium text-gray-500">Budget Usage</span>
                                            <span className={`text-sm font-bold ${isOver ? 'text-red-600' : 'text-green-600'}`}>
                                                {isOver ? `OVER BUDGET (-${varianceVal.toLocaleString()})` : `On Track (${Math.round(progress)}%)`}
                                            </span>
                                        </div>
                                        <div className="relative h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                                                    cycle.status === 'harvesting' ? 'bg-amber-500' :
                                                    cycle.status === 'completed' ? 'bg-gray-400' :
                                                    isOver ? 'bg-red-500' : 'bg-green-500'
                                                }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1 text-[10px] font-mono text-gray-400">
                                            <span>{spent.toLocaleString()} spent</span>
                                            <span>{total.toLocaleString()} budget</span>
                                        </div>
                                    </div>

                                    {/* Footer Action */}
                                    <button
                                        onClick={() => setSelectedCycle({
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
                                        })}
                                        className="w-full py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors"
                                    >
                                        Manage Cycle <ChevronRight size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

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
                        fetchCycles();
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
                    isOpen={!!selectedCycle}
                    onClose={() => setSelectedCycle(null)}
                    cycle={selectedCycle}
                    onCloseCycle={(finalYield) => handleCloseCycle(selectedCycle._id, finalYield)}
                />
            )}
        </div>
    );
};

export default CropPlanning;
