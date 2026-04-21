import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Thermometer, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface AssignRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    batch: any;
    onSuccess: () => void;
}

const AssignRoomModal = ({ isOpen, onClose, batch, onSuccess }: AssignRoomModalProps) => {
    const [assignedRoom, setAssignedRoom] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignedRoom.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await api.patch(`/processing-batches/${batch._id}/assign-room`, { assignedRoom });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Failed to assign room:', err);
            setError(err.message || 'Failed to assign room. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !batch) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Thermometer size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Assign Cold Room</h2>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mt-0.5">Inventory Intake</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        
                        {/* Batch Summary */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Batch Crop</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{batch.cropName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Weight Received</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{batch.receivedWeightKg?.toLocaleString()} kg</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Requested By</p>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        {batch.requestedBy?.name || batch.requestedBy?.full_name || 'Processing Team'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Room Assignment Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                Room Name / Number
                            </label>
                            <input
                                autoFocus
                                type="text"
                                required
                                value={assignedRoom}
                                onChange={e => setAssignedRoom(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold placeholder-gray-400"
                                placeholder="e.g. Room 2A, Cold Storage 1"
                            />
                            <p className="text-[10px] text-gray-500 mt-2 ml-1 italic">
                                This will move the batch status to 'Processing' upon assignment.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-5 bg-gray-50/80 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !assignedRoom.trim()}
                            className={`px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all ${
                                isSubmitting || !assignedRoom.trim()
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 shadow-emerald-900/20'
                            }`}
                        >
                            {isSubmitting ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <CheckCircle2 size={18} />
                            )}
                            {isSubmitting ? 'Assigning...' : 'Assign Room'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AssignRoomModal;
