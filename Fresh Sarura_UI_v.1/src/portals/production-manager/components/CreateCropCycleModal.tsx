import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CreateCropCycleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

const CreateCropCycleModal = ({ isOpen, onClose, onSubmit }: CreateCropCycleModalProps) => {
    const [formData, setFormData] = useState({
        farmName: '',
        cropName: '',
        season: '',
        startDate: '',
        expectedHarvestDate: '',
        blockName: '',
        blockSize: '',
        totalBudget: 0,
        allocations: {
            seeds: 0,
            fertilizers: 0,
            chemicals: 0,
            labor: 0
        }
    });

    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        const allocated = Object.values(formData.allocations).reduce((acc, curr) => acc + (curr || 0), 0);
        setRemaining(formData.totalBudget - allocated);
    }, [formData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAllocationChange = (category: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setFormData(prev => ({
            ...prev,
            allocations: {
                ...prev.allocations,
                [category]: numValue
            }
        }));
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Crop Cycle</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Establish budget & limits</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 flex-1 overflow-y-auto">

                    {/* Section 1: Context */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">1. Context</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Farm Selection</label>
                                <select
                                    name="farmName"
                                    value={formData.farmName}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Select a Farm...</option>
                                    <option value="Kayonza Farm">Kayonza Farm</option>
                                    <option value="Rwamagana Estate">Rwamagana Estate</option>
                                    <option value="Nyagatare Co-op">Nyagatare Co-op</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crop</label>
                                    <input
                                        type="text"
                                        name="cropName"
                                        value={formData.cropName}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Avocado"
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Season</label>
                                    <input
                                        type="text"
                                        name="season"
                                        value={formData.season}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Season A"
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            {/* Date Pickers Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Harvest Date</label>
                                    <input
                                        type="date"
                                        name="expectedHarvestDate"
                                        value={formData.expectedHarvestDate}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            {/* Block Information Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Block Name</label>
                                    <input
                                        type="text"
                                        name="blockName"
                                        value={formData.blockName}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Block A"
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Block Size (Hectares)</label>
                                    <input
                                        type="number"
                                        name="blockSize"
                                        value={formData.blockSize}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 2.5"
                                        min="0"
                                        step="0.1"
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Global Limit */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">2. Global Limit</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Allocated Budget (Rwf)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rwf</span>
                                <input
                                    type="number"
                                    name="totalBudget"
                                    value={formData.totalBudget || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, totalBudget: parseInt(e.target.value) || 0 }))}
                                    className="w-full pl-12 pr-4 py-3 text-lg font-bold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Sticky Calculator for Mobile */}
                    <div className={`sticky top-0 z-20 transition-transform duration-300 ${remaining < 0 ? 'scale-105' : 'scale-100'}`}>
                        <div className={`p-4 rounded-xl shadow-lg border ${remaining < 0
                            ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                            : remaining === 0 && formData.totalBudget > 0
                                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                            }`}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Calculator size={18} />
                                    <span className="font-semibold text-sm">Unallocated Remaining:</span>
                                </div>
                                <span className="font-mono font-bold text-lg">
                                    {remaining.toLocaleString()}
                                </span>
                            </div>
                            {remaining < 0 && (
                                <p className="text-xs mt-1 font-medium flex items-center gap-1">
                                    <AlertTriangle size={12} />
                                    You are over budget by {Math.abs(remaining).toLocaleString()} Rwf!
                                </p>
                            )}
                            {remaining === 0 && formData.totalBudget > 0 && (
                                <p className="text-xs mt-1 font-medium flex items-center gap-1">
                                    <CheckCircle2 size={12} />
                                    Budget perfectly allocated.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Category Buckets */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">3. Category Allocation ("Buckets")</h3>
                        <div className="space-y-4">
                            {Object.keys(formData.allocations).map((category) => (
                                <div key={category}>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{category}</label>
                                        <span className="text-xs text-gray-400">
                                            {formData.allocations[category as keyof typeof formData.allocations]
                                                ? `${((formData.allocations[category as keyof typeof formData.allocations] / formData.totalBudget) * 100).toFixed(1)}%`
                                                : '0%'}
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        value={formData.allocations[category as keyof typeof formData.allocations] || ''}
                                        onChange={(e) => handleAllocationChange(category, e.target.value)}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder={`Allocated for ${category}`}
                                    />
                                    {/* Visual Progress relative to Total Budget (just for visual aid) */}
                                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 mt-1 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${Math.min(((formData.allocations[category as keyof typeof formData.allocations] || 0) / (formData.totalBudget || 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <button
                        onClick={() => onSubmit(formData)}
                        disabled={remaining !== 0}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${remaining !== 0
                            ? 'bg-gray-400 cursor-not-allowed opacity-70'
                            : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-green-900/20'
                            }`}
                    >
                        {remaining !== 0 ? 'Balance Budget to Continue' : 'Create & Activate Cycle'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateCropCycleModal;
