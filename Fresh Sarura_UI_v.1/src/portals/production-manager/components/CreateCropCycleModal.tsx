import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calculator, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { api } from '@/lib/api';

interface CreateCropCycleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

const CreateCropCycleModal = ({ isOpen, onClose, onSubmit }: CreateCropCycleModalProps) => {
    const [formData, setFormData] = useState({
        farmer_id: '',
        farm_name: '',
        crop_name: '',
        season: '',
        planting_date: '',
        start_date: '',
        expected_harvest_date: '',
        block_name: '',
        block_size_hectares: '',
        field_size_hectares: '',
        yield_goal_kg: '',
        total_budget: 0,
        budget_seeds: 0,
        budget_fertilizers: 0,
        budget_chemicals: 0,
        budget_labor: 0,
    });

    const [remaining, setRemaining] = useState(0);
    const [farmers, setFarmers] = useState<any[]>([]);
    const [farmersLoading, setFarmersLoading] = useState(false);

    // Derived: selected farmer object
    const selectedFarmer = farmers.find(f => f._id === formData.farmer_id) ?? null;
    const farmerMaxHa: number = selectedFarmer?.farm_size_hectares ?? 0;

    // Validation flags
    const blockExceedsMax = farmerMaxHa > 0 && parseFloat(formData.block_size_hectares) > farmerMaxHa;
    const fieldExceedsMax = farmerMaxHa > 0 && parseFloat(formData.field_size_hectares) > farmerMaxHa;

    // Produce types from selected farmer
    const produceTypes: string[] = selectedFarmer?.produce_types ?? [];

    // Fetch farmers when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setFarmersLoading(true);
        api.get('/farmers')
            .then((res) => setFarmers(res.farmers ?? []))
            .catch((err) => console.error('Failed to load farmers:', err))
            .finally(() => setFarmersLoading(false));
    }, [isOpen]);

    // Recalculate remaining budget
    useEffect(() => {
        const allocated = formData.budget_seeds + formData.budget_fertilizers + formData.budget_chemicals + formData.budget_labor;
        setRemaining(formData.total_budget - allocated);
    }, [formData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumericChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    // When a farmer is selected — auto-populate all farmer-derived fields
    const handleFarmerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const farmer = farmers.find(f => f._id === selectedId);
        const farmHa = farmer?.farm_size_hectares ?? '';
        const yieldGoal = farmer?.production_capacity_tons
            ? String(Math.round(farmer.production_capacity_tons * 1000))
            : '';
        const types: string[] = farmer?.produce_types ?? [];

        setFormData(prev => ({
            ...prev,
            farmer_id: selectedId,
            farm_name: farmer?.farm_name || farmer?.full_name || '',
            // Auto-select crop if only one produce type
            crop_name: types.length === 1 ? types[0] : '',
            // Pre-fill sizes with farmer's registered farm size
            block_size_hectares: farmHa ? String(farmHa) : '',
            field_size_hectares: farmHa ? String(farmHa) : '',
            // Pre-fill yield goal
            yield_goal_kg: yieldGoal,
        }));
    };

    if (!isOpen) return null;

    const budgetCategories: { key: keyof typeof formData; label: string }[] = [
        { key: 'budget_seeds', label: 'Seeds' },
        { key: 'budget_fertilizers', label: 'Fertilizers' },
        { key: 'budget_chemicals', label: 'Chemicals' },
        { key: 'budget_labor', label: 'Labor' },
    ];

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
                        <p className="text-sm text-gray-500 dark:text-gray-400">Establish budget &amp; limits</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar">

                    {/* Section 1: Context */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">1. Context</h3>
                        <div className="space-y-4">

                            {/* Farmer / Farm selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Farm / Farmer</label>
                                <select
                                    name="farmer_id"
                                    value={formData.farmer_id}
                                    onChange={handleFarmerSelect}
                                    disabled={farmersLoading}
                                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none disabled:opacity-60"
                                >
                                    <option value="">
                                        {farmersLoading ? 'Loading farms...' : 'Select a Farmer / Farm...'}
                                    </option>
                                    {farmers.map((farmer) => (
                                        <option key={farmer._id} value={farmer._id}>
                                            {farmer.farm_name
                                                ? `${farmer.farm_name} — ${farmer.full_name}`
                                                : farmer.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Farmer Constraints Info Panel — shown only when a farmer is selected */}
                            {selectedFarmer && (
                                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40 rounded-xl p-4 space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Info size={14} className="text-green-600" />
                                        <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">Farmer Constraints</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-xs">
                                        <div>
                                            <p className="text-gray-400 font-medium">Farm Size</p>
                                            <p className="font-bold text-gray-800 dark:text-gray-100">
                                                {selectedFarmer.farm_size_hectares ?? '—'} Ha
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-medium">Capacity</p>
                                            <p className="font-bold text-gray-800 dark:text-gray-100">
                                                {selectedFarmer.production_capacity_tons != null
                                                    ? `${selectedFarmer.production_capacity_tons} t/season`
                                                    : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-medium">Produce Types</p>
                                            <p className="font-bold text-gray-800 dark:text-gray-100 truncate" title={produceTypes.join(', ')}>
                                                {produceTypes.length > 0 ? produceTypes.join(', ') : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {/* Crop — dropdown from produce_types if farmer selected, otherwise text input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crop</label>
                                    {produceTypes.length > 0 ? (
                                        <select
                                            name="crop_name"
                                            value={formData.crop_name}
                                            onChange={handleInputChange}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            {produceTypes.length > 1 && <option value="">Select crop...</option>}
                                            {produceTypes.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            name="crop_name"
                                            value={formData.crop_name}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Avocado"
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    )}
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

                            {/* Dates Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Planting Date</label>
                                    <input
                                        type="date"
                                        name="planting_date"
                                        value={formData.planting_date}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Harvest Date</label>
                                <input
                                    type="date"
                                    name="expected_harvest_date"
                                    value={formData.expected_harvest_date}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {/* Block & Field Size Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Block Name</label>
                                    <input
                                        type="text"
                                        name="block_name"
                                        value={formData.block_name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Block A"
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Block Size (Ha)</label>
                                    <input
                                        type="number"
                                        name="block_size_hectares"
                                        value={formData.block_size_hectares}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 2.5"
                                        min="0"
                                        step="0.1"
                                        className={`w-full p-2.5 rounded-lg border bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 ${
                                            blockExceedsMax
                                                ? 'border-red-400 focus:ring-red-400'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-green-500'
                                        }`}
                                    />
                                    {blockExceedsMax && (
                                        <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                                            <AlertTriangle size={11} />
                                            Exceeds registered farm size of {farmerMaxHa} Ha
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Field Size (Ha)</label>
                                <input
                                    type="number"
                                    name="field_size_hectares"
                                    value={formData.field_size_hectares}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 10"
                                    min="0"
                                    step="0.1"
                                    className={`w-full p-2.5 rounded-lg border bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 ${
                                        fieldExceedsMax
                                            ? 'border-red-400 focus:ring-red-400'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-green-500'
                                    }`}
                                />
                                {fieldExceedsMax && (
                                    <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                                        <AlertTriangle size={11} />
                                        Exceeds registered farm size of {farmerMaxHa} Ha
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Yield Goal (kg)
                                    <span className="ml-1 text-xs text-gray-400 font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">kg</span>
                                    <input
                                        type="number"
                                        name="yield_goal_kg"
                                        value={formData.yield_goal_kg}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 5000"
                                        min="0"
                                        step="1"
                                        className="w-full pl-12 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                {selectedFarmer?.production_capacity_tons && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Pre-filled from farmer capacity ({selectedFarmer.production_capacity_tons} t/season). Adjust if needed.
                                    </p>
                                )}
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
                                    name="total_budget"
                                    value={formData.total_budget || ''}
                                    onChange={(e) => handleNumericChange('total_budget', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 text-lg font-bold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Budget tracker */}
                    <div className={`sticky top-0 z-20 transition-transform duration-300 ${remaining < 0 ? 'scale-105' : 'scale-100'}`}>
                        <div className={`p-4 rounded-xl shadow-lg border ${remaining < 0
                            ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                            : remaining === 0 && formData.total_budget > 0
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
                            {remaining === 0 && formData.total_budget > 0 && (
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
                            {budgetCategories.map(({ key, label }) => (
                                <div key={key}>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                                        <span className="text-xs text-gray-400">
                                            {formData[key] && formData.total_budget > 0
                                                ? `${(((formData[key] as number) / formData.total_budget) * 100).toFixed(1)}%`
                                                : '0%'}
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        value={(formData[key] as number) || ''}
                                        onChange={(e) => handleNumericChange(key, e.target.value)}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder={`Allocated for ${label}`}
                                        min="0"
                                    />
                                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 mt-1 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${Math.min((((formData[key] as number) || 0) / (formData.total_budget || 1)) * 100, 100)}%` }}
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
                        disabled={remaining < 0}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${remaining < 0
                            ? 'bg-gray-400 cursor-not-allowed opacity-70'
                            : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-green-900/20'
                            }`}
                    >
                        {remaining < 0 ? 'Over Budget — Adjust Allocations' : 'Create & Activate Cycle'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateCropCycleModal;
