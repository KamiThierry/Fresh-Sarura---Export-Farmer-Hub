import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Phone, Calendar, Save, AlertCircle } from 'lucide-react';

interface AddDriverModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddDriverModal = ({ isOpen, onClose }: AddDriverModalProps) => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '+250 ',
        licenseCategories: [] as string[],
        licenseExpiry: '',
        status: 'Idle'
    });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (formData.licenseExpiry) {
            const today = new Date();
            const expiry = new Date(formData.licenseExpiry);
            setIsExpired(expiry < today);
        } else {
            setIsExpired(false);
        }
    }, [formData.licenseExpiry]);

    if (!isOpen) return null;

    const handleCategoryChange = (category: string) => {
        setFormData(prev => {
            if (prev.licenseCategories.includes(category)) {
                return { ...prev, licenseCategories: prev.licenseCategories.filter(c => c !== category) };
            } else {
                return { ...prev, licenseCategories: [...prev.licenseCategories, category] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isExpired) return;
        console.log('Submitting Driver:', formData);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Register New Driver</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Create a personnel file for a new driver.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Full Name */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. John Mugisha"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number (WhatsApp)</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Critical for Dispatch Magic Link SMS routing.</p>
                        </div>

                        {/* License Categories */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">License Categories</label>
                            <div className="flex gap-4">
                                {['Cat B', 'Cat C', 'Cat F'].map(cat => (
                                    <label key={cat} className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.licenseCategories.includes(cat)}
                                            onChange={() => handleCategoryChange(cat)}
                                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* License Expiry */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">License Expiry Date</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    value={formData.licenseExpiry}
                                    onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-2 outline-none transition-all ${isExpired ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-500'}`}
                                />
                            </div>
                            {isExpired && (
                                <p className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
                                    <AlertCircle size={12} />
                                    Cannot register a driver with an expired license.
                                </p>
                            )}
                        </div>

                        {/* Initial Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Initial Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="Idle">Idle</option>
                                <option value="Off Duty">Off Duty</option>
                            </select>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isExpired}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all ${isExpired ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 hover:scale-105 active:scale-95'}`}
                        >
                            <Save size={18} />
                            Save Driver
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AddDriverModal;
