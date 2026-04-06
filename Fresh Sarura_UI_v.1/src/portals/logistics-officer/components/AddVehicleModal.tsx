import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Truck, Calendar, Save } from 'lucide-react';

interface AddVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddVehicleModal = ({ isOpen, onClose }: AddVehicleModalProps) => {
    const [formData, setFormData] = useState({
        plate: '',
        type: 'Refrigerated Truck',
        capacity: '',
        status: 'Available',
        nextService: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would make an API call
        console.log('Submitting Vehicle:', formData);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Register New Vehicle</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add a new asset to the fleet.</p>
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

                        {/* Plate Number */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Plate Number</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. RAB 123 C"
                                value={formData.plate}
                                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                            />
                        </div>

                        {/* Vehicle Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Type</label>
                            <div className="relative">
                                <Truck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Refrigerated Truck">Refrigerated Truck</option>
                                    <option value="Standard Truck">Standard Truck</option>
                                    <option value="Pickup">Pickup</option>
                                    <option value="Van">Van</option>
                                </select>
                            </div>
                        </div>

                        {/* Capacity */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Capacity (kg)</label>
                            <input
                                type="number"
                                required
                                placeholder="e.g. 5000"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                            <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">Critical for overload protection.</p>
                        </div>

                        {/* Initial Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Initial Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="Available">Available</option>
                                <option value="Maintenance">Maintenance</option>
                            </select>
                        </div>

                        {/* Next Service Date */}
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Service Date</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    value={formData.nextService}
                                    onChange={(e) => setFormData({ ...formData, nextService: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all accent-emerald-500"
                                />
                            </div>
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
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Save size={18} />
                            Save Vehicle
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AddVehicleModal;
