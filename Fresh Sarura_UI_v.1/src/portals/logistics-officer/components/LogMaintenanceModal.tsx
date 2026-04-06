import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Wrench, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

interface LogMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehiclePlate: string;
}

const LogMaintenanceModal = ({ isOpen, onClose, vehiclePlate }: LogMaintenanceModalProps) => {
    const [formData, setFormData] = useState({
        reason: '',
        returnDate: '',
        cost: '',
        markAsMaintenance: true
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(`Logging Maintenance for ${vehiclePlate}:`, formData);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/10">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                            <Wrench size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Log Maintenance</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Service record for <span className="font-bold text-gray-900 dark:text-white">{vehiclePlate}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Warning Banner */}
                <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-3 flex items-start gap-3 border-b border-amber-100 dark:border-amber-900/10">
                    <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        Submitting this log will automatically mark the vehicle as <strong>Unavailable</strong> in the Dispatch Board until the return date.
                    </p>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Reason / Description</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="e.g. Brake pad replacement and oil change..."
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Return Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expected Return</label>
                            <input
                                type="date"
                                required
                                value={formData.returnDate}
                                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            />
                        </div>

                        {/* Cost */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Est. Cost (RWF)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={formData.cost}
                                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Action Toggle */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <input
                            type="checkbox"
                            checked={formData.markAsMaintenance}
                            onChange={(e) => setFormData({ ...formData, markAsMaintenance: e.target.checked })}
                            id="markMaintenance"
                            className="mt-1 w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                        />
                        <label htmlFor="markMaintenance" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <span className="font-bold block mb-0.5">Mark as 'Maintenance' Status</span>
                            Remove from available fleet for dispatch immediately.
                        </label>
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
                            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-900/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <CheckCircle size={18} />
                            Confirm Service
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default LogMaintenanceModal;
