import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ActivityLineItem, BudgetRequest } from '../../shared/types/activity';

interface BudgetActivityRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    cycleId: number;
    cycleName: string;
    submittedBy?: string;
    /** Called with the finalised BudgetRequest on submission */
    onSubmit: (request: BudgetRequest) => void;
}

const emptyLine = (): ActivityLineItem => ({
    id: Date.now() + Math.random(),
    activityName: '',
    category: '',
    estimatedCostRwf: 0,
});

const BudgetActivityRequestModal = ({
    isOpen,
    onClose,
    cycleId,
    cycleName,
    submittedBy = 'Farm Manager',
    onSubmit,
}: BudgetActivityRequestModalProps) => {
    const [lineItems, setLineItems] = useState<ActivityLineItem[]>([emptyLine()]);
    const [globalStartDate, setGlobalStartDate] = useState('');
    const [globalEndDate, setGlobalEndDate] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    if (!isOpen) return null;

    const totalRwf = lineItems.reduce((sum, l) => sum + (l.estimatedCostRwf || 0), 0);

    const updateLine = (id: number, field: keyof ActivityLineItem, value: string | number) => {
        setLineItems(prev =>
            prev.map(l => (l.id === id ? { ...l, [field]: value } : l))
        );
    };

    const addLine = () => setLineItems(prev => [...prev, emptyLine()]);

    const removeLine = (id: number) => {
        if (lineItems.length === 1) return; // keep at least one row
        setLineItems(prev => prev.filter(l => l.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        const request: BudgetRequest = {
            id: Date.now(),
            cycleId,
            cycleName,
            submittedBy,
            submittedAt: new Date().toISOString(),
            startDate: globalStartDate,
            endDate: globalEndDate,
            lineItems,
            totalRequestedRwf: totalRwf,
            approvalStatus: 'Pending',
        };

        try {
            await onSubmit(request);
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setLineItems([emptyLine()]);
                onClose();
            }, 1800);
        } catch (err: any) {
            setSubmitError(err.message || 'Failed to submit request.');
        }
    };

    const isValid = globalStartDate && globalEndDate && lineItems.every(
        l => l.activityName.trim() && l.category && l.category.trim() && l.estimatedCostRwf > 0
    );

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                            <ClipboardList size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Budget & Activity Request</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                For <span className="font-semibold text-gray-700 dark:text-gray-300">{cycleName}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Success state */}
                {submitted ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={28} className="text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">Request Submitted!</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Awaiting Production Manager approval.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                        {/* Global Period Section */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Request Period</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={globalStartDate}
                                        onChange={e => setGlobalStartDate(e.target.value)}
                                        required
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={globalEndDate}
                                        onChange={e => setGlobalEndDate(e.target.value)}
                                        required
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Scrollable line items */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-4">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Proposed Activities</p>
                                <p className="text-xs text-gray-400">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</p>
                            </div>

                            {lineItems.map((line, idx) => (
                                <div
                                    key={line.id}
                                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-3 relative group"
                                >
                                    {/* Row number */}
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold uppercase text-gray-400">Activity #{idx + 1}</span>
                                        {lineItems.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeLine(line.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {/* Activity Name */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                                Activity Name
                                            </label>
                                            <input
                                                type="text"
                                                value={line.activityName}
                                                onChange={e => updateLine(line.id, 'activityName', e.target.value)}
                                                placeholder="e.g. Weeding Block B1"
                                                required
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-500 transition-all placeholder-gray-400"
                                            />
                                        </div>

                                        {/* Row 2: Category & Estimated Cost */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Category */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                                    Category
                                                </label>
                                                <select
                                                    value={line.category || ''}
                                                    onChange={e => updateLine(line.id, 'category', e.target.value)}
                                                    required
                                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-500 transition-all"
                                                >
                                                    <option value="">Select Category...</option>
                                                    <option value="Seeds & Seedlings">Seeds & Seedlings</option>
                                                    <option value="Fertilizers">Fertilizers</option>
                                                    <option value="Chemicals">Chemicals</option>
                                                    <option value="Labor">Labor</option>
                                                </select>
                                            </div>

                                            {/* Estimated Cost */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                                    Estimated Cost (Rwf)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="500"
                                                    value={line.estimatedCostRwf || ''}
                                                    onChange={e => updateLine(line.id, 'estimatedCostRwf', parseInt(e.target.value) || 0)}
                                                    placeholder="0"
                                                    required
                                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add another activity */}
                            <button
                                type="button"
                                onClick={addLine}
                                className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-400 transition-all text-sm font-medium flex items-center justify-center gap-2"
                            >
                                <Plus size={16} />
                                Add Another Activity
                            </button>
                        </div>

                        {/* Footer: total + submit */}
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 space-y-3">
                            {/* Running total */}
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                    Total Requested Amount
                                </span>
                                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-lg">
                                    {totalRwf.toLocaleString()} Rwf
                                </span>
                            </div>

                            {/* Error messages / Validation hint */}
                            {submitError && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-bold">
                                    <AlertCircle size={14} />
                                    {submitError}
                                </div>
                            )}

                            {!isValid && lineItems.some(l => l.activityName) && !submitError && (
                                <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                    <AlertCircle size={13} />
                                    Please complete all fields for every activity before submitting.
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={!isValid}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${isValid
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/10 active:scale-[0.98]'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Submit for PM Approval
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
};

export default BudgetActivityRequestModal;
