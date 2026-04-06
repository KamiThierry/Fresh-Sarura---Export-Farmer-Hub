import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Truck, CheckCircle } from 'lucide-react';

interface AssignTruckModalProps {
    isOpen: boolean;
    onClose: () => void;
    driverName: string;
    licenseStatus: string;
    availableVehicles: Array<{ id: string, plate: string, type: string }>;
}

const AssignTruckModal = ({ isOpen, onClose, driverName, licenseStatus, availableVehicles }: AssignTruckModalProps) => {
    const [formData, setFormData] = useState({
        status: 'Idle',
        vehicleId: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(`Assigning Truck to ${driverName}:`, formData);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/10">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/20 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assign Vehicle</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Link a fleet asset to this driver.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Context Area */}
                <div className="bg-indigo-50/50 dark:bg-indigo-900/5 px-6 py-4 border-b border-indigo-100 dark:border-indigo-900/10">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-indigo-500 uppercase font-bold tracking-wider">Driver</p>
                            <p className="text-gray-900 dark:text-white font-bold">{driverName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-indigo-500 uppercase font-bold tracking-wider">License Status</p>
                            <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">{licenseStatus}</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    <div className="grid grid-cols-1 gap-6">

                        {/* Current Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Driver Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="Idle">Idle</option>
                                <option value="Off Duty">Off Duty</option>
                            </select>
                        </div>

                        {/* Assigned Vehicle */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assign Available Vehicle</label>
                            <div className="relative">
                                <Truck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    required
                                    value={formData.vehicleId}
                                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                                >
                                    <option value="" disabled>Select a vehicle...</option>
                                    {availableVehicles.map(vehicle => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.plate} ({vehicle.type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-gray-500">Only showing vehicles currently marked as 'Available'.</p>
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
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <CheckCircle size={18} />
                            Confirm Assignment
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AssignTruckModal;
