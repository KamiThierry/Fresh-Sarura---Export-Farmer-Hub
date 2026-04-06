import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface BudgetLedgerModalProps {
    isOpen: boolean;
    onClose: () => void;
    data?: {
        farmName: string;
        season: string;
        crop: string;
        budget: {
            total: number;
            spent: number;
            variance: number;
        }
    } | null;
}

const BudgetLedgerModal = ({ isOpen, onClose, data: _data }: BudgetLedgerModalProps) => { // 'data' prop reserved for future integration
    if (!isOpen) return null;

    // Mock Data for the specific view
    const ledgerData = {
        categories: [
            { name: 'Seeds & Seedlings', allocated: 250000, spent: 245000, status: 'ok' },
            { name: 'Fertilizers', allocated: 400000, spent: 380000, status: 'ok' },
            { name: 'Chemicals', allocated: 350000, spent: 403000, status: 'over' },
            { name: 'Labor', allocated: 500000, spent: 480000, status: 'ok' }
        ],
        transactions: [
            { id: 1, item: 'Urea Fertilizer (50kg)', amount: 45000, date: 'Today, 10:30 AM', category: 'Fertilizers', user: 'Jean Pierre' },
            { id: 2, item: 'Fungicide Spray', amount: 32000, date: 'Yesterday', category: 'Chemicals', user: 'Jean Pierre' },
            { id: 3, item: 'Weeding Labor (15 Pax)', amount: 45000, date: 'Oct 24', category: 'Labor', user: 'Sarah M.' },
            { id: 4, item: 'Avocado Seedlings', amount: 120000, date: 'Oct 20', category: 'Seeds', user: 'System' },
        ]
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-white dark:bg-gray-800">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Active Cycle
                            </span>
                            <span className="text-xs text-gray-500">• Kayonza Farm</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Budget Ledger: Avocados (Season A)</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Variance Analysis & Expense Log</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 overflow-y-auto">

                    {/* Variance Summary Table */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingDown size={18} className="text-blue-500" />
                            Category Performance
                        </h3>

                        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3 text-right">Allocated</th>
                                        <th className="px-4 py-3 text-right">Actual</th>
                                        <th className="px-4 py-3 text-right">Variance</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                    {ledgerData.categories.map((cat, idx) => {
                                        const variance = cat.allocated - cat.spent;
                                        const isNegative = variance < 0;
                                        return (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{cat.name}</td>
                                                <td className="px-4 py-3 text-right text-gray-500">{cat.allocated.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-200">{cat.spent.toLocaleString()}</td>
                                                <td className={`px-4 py-3 text-right font-bold ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
                                                    {isNegative ? '' : '+'}{variance.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {isNegative ? (
                                                        <div className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded dark:bg-red-900/20 dark:text-red-400">
                                                            <AlertCircle size={12} /> OVER
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded dark:bg-green-900/20 dark:text-green-400">
                                                            <CheckCircle size={12} /> OK
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Recently Logged Expenses */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-purple-500" />
                            Recently Logged Expenses
                        </h3>

                        <div className="space-y-3">
                            {ledgerData.transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                                            🧾
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{tx.item}</p>
                                            <p className="text-xs text-gray-500">{tx.category} • {tx.user} • {tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">-{tx.amount.toLocaleString()} Rwf</p>
                                        <p className="text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded inline-block mt-0.5">Logged</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>,
        document.body
    );
};

export default BudgetLedgerModal;
