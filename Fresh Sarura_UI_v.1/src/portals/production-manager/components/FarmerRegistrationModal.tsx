import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, User } from 'lucide-react';
import { api } from '@/lib/api';

interface FarmerRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFarmerAdded: () => void;
}

const FarmerRegistrationModal = ({ isOpen, onClose, onFarmerAdded }: FarmerRegistrationModalProps) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        full_name: '',
        farm_name: '',
        national_id: '',
        district: '',
        sector: '',
        cell: '',
        village: '',
        produce_types: [] as string[],
        farm_size_hectares: '',
        production_capacity_tons: '',
        phone: '',
        email: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);


    const districts = ['Kigali', 'Musanze', 'Rubavu', 'Nyagatare', 'Huye', 'Muhanga'];
    const sectors = ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Gicumbi', 'Kayonza'];
    const produceOptions = [
        'French Beans',
        'Chili Peppers',
        'Avocados',
        'Passion Fruits',
        'Tomatoes',
        'Mangoes',
    ];

    const handleProduceToggle = (produce: string) => {
        setFormData((prev) => ({
            ...prev,
            produce_types: prev.produce_types.includes(produce)
                ? prev.produce_types.filter((p) => p !== produce)
                : [...prev.produce_types, produce],
        }));
    };

    const djangoHandleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const dataToSubmit = {
                ...formData,
                farm_size_hectares: parseFloat(formData.farm_size_hectares),
                production_capacity_tons: parseFloat(formData.production_capacity_tons)
            };
            await api.post('/farmers', dataToSubmit);
            onFarmerAdded();
            onClose();
        } catch (error: any) {
            alert(error.message || 'Failed to register farmer');
        } finally {
            setIsSubmitting(false);
        }
    };
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Register New Farmer</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add a new supplier to the network</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <form id="farmer-form" onSubmit={djangoHandleSubmit} className="space-y-5">

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    placeholder="Enter farmer's full name"
                                />
                            </div>
                        </div>

                        {/* Farm Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Farm Name (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.farm_name}
                                onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                placeholder="Enter farm name (if applicable)"
                            />
                        </div>

                        {/* National ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                National ID (16 Digits) *
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={16}
                                value={formData.national_id}
                                onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                placeholder="e.g. 1 1990 8 0123456 7 89"
                            />
                        </div>

                        {/* District & Sector */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    District *
                                </label>
                                <select
                                    required
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                >
                                    <option value="">Select District</option>
                                    {districts.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Sector *
                                </label>
                                <select
                                    required
                                    value={formData.sector}
                                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                >
                                    <option value="">Select Sector</option>
                                    {sectors.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Cell & Village */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Cell *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.cell}
                                    onChange={(e) => setFormData({ ...formData, cell: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    placeholder="Enter cell"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Village *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.village}
                                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    placeholder="Enter village"
                                />
                            </div>
                        </div>

                        {/* Produce Types */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Produce Type *
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {produceOptions.map((produce) => (
                                    <button
                                        key={produce}
                                        type="button"
                                        onClick={() => handleProduceToggle(produce)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formData.produce_types.includes(produce)
                                            ? 'bg-green-100 text-green-700 border-2 border-green-500 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-green-500 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700'
                                            }`}
                                    >
                                        {produce}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Farm Size & Production Capacity */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Farm Size (Ha) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.farm_size_hectares}
                                    onChange={(e) => setFormData({ ...formData, farm_size_hectares: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Capacity (Tons) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.production_capacity_tons}
                                    onChange={(e) => setFormData({ ...formData, production_capacity_tons: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>


                        {/* Phone & Email */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    placeholder="+250 xxx xxx xxx"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>

                        {/* ID Upload */}
                        <div className="pt-2">
                            <button type="button" className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
                                <Upload size={24} className="mb-2" />
                                <span className="text-sm font-medium">Click to upload ID Card</span>
                                <span className="text-xs text-gray-400 mt-1">PG, PNG or PDF (Max 5MB)</span>
                            </button>
                        </div>

                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="farmer-form"
                        className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                    >
                        {isSubmitting ? 'Registering...' : 'Register Farmer'}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default FarmerRegistrationModal;
