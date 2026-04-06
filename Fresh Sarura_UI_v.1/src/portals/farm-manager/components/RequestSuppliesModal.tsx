import { createPortal } from 'react-dom';
import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface RequestSuppliesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CROP_CYCLES = [
    'Avocado (Hass) — Block A',
    'Avocado (Fuerte) — Block B',
    'French Beans — Block C',
    'Chili (Bird Eye) — Block D',
    'Chili (Bird Eye) — Block E',
];

const CATEGORIES = ['Fertilizer', 'Seeds', 'Labor', 'Chemicals'] as const;
type Category = typeof CATEGORIES[number];

const RequestSuppliesModal = ({ isOpen, onClose }: RequestSuppliesModalProps) => {
    const [cropCycle, setCropCycle] = useState(CROP_CYCLES[0]);
    const [category, setCategory] = useState<Category | ''>('');
    const [quantity, setQuantity] = useState('');
    const [requiredBy, setRequiredBy] = useState('');
    const [reason, setReason] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setCategory('');
            setQuantity('');
            setRequiredBy('');
            setReason('');
            onClose();
        }, 1800);
    };

    const cropLabel = cropCycle.split(' —')[0]; // e.g. "Avocado (Hass)"

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal card */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-1">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Request Inputs</h2>
                        {!submitted && (
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                                For {cropLabel}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Success state */}
                {submitted ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={28} className="text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">Request Submitted!</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your supply request has been sent.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-5 space-y-5">

                            {/* Crop Cycle */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Crop Cycle
                                </label>
                                <select
                                    value={cropCycle}
                                    onChange={e => setCropCycle(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition-all"
                                >
                                    {CROP_CYCLES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Category
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {CATEGORIES.map(cat => (
                                        <label
                                            key={cat}
                                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm font-medium ${category === cat
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat}
                                                checked={category === cat}
                                                onChange={() => setCategory(cat)}
                                                required
                                                className="accent-green-600 w-4 h-4 flex-shrink-0"
                                            />
                                            {cat}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity + Required By */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Quantity / Amount
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 50 kg"
                                        value={quantity}
                                        onChange={e => setQuantity(e.target.value)}
                                        required
                                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition-all placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Required By
                                    </label>
                                    <input
                                        type="date"
                                        value={requiredBy}
                                        onChange={e => setRequiredBy(e.target.value)}
                                        required
                                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Reason for Request
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Why is this needed?"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition-all placeholder-gray-400 resize-none"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6">
                            <button
                                type="submit"
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
};

export default RequestSuppliesModal;
