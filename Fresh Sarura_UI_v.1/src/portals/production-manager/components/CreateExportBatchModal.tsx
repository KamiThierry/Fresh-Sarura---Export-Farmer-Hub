import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plane, Package, Plus, Trash2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';

interface CreateExportBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    stock: any[];
    onSuccess: () => void;
}

const CreateExportBatchModal = ({ isOpen, onClose, stock, onSuccess }: CreateExportBatchModalProps) => {
    const [clientName, setClientName] = useState('');
    const [destination, setDestination] = useState('');
    const [targetShipmentDate, setTargetShipmentDate] = useState('');
    const [gradeLabel, setGradeLabel] = useState('Grade A');
    const [boxCount, setBoxCount] = useState('');
    const [weightPerBoxKg, setWeightPerBoxKg] = useState('');
    const [selectedStock, setSelectedStock] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setClientName(''); setDestination(''); setTargetShipmentDate('');
            setGradeLabel('Grade A'); setBoxCount(''); setWeightPerBoxKg('');
            setSelectedStock(null); setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Only show available stock (Done processing batches not yet exported)
    const availableStock = stock.filter(s => s.status === 'Done' || s.processedWeightKg > 0);

    const totalWeightKg = (Number(boxCount) || 0) * (Number(weightPerBoxKg) || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStock) { setError('Please select a stock item.'); return; }
        if (!clientName || !destination) { setError('Client name and destination are required.'); return; }
        if (!boxCount || !weightPerBoxKg) { setError('Box count and weight per box are required.'); return; }

        setIsSubmitting(true);
        setError(null);
        try {
            await api.post('/export-batches', {
                processingBatchId: selectedStock._id,
                cycleId: selectedStock.cycleId,
                cropName: selectedStock.cropName,
                clientName,
                destination,
                gradeLabel,
                allocatedWeightKg: totalWeightKg,
                boxCount: Number(boxCount),
                weightPerBoxKg: Number(weightPerBoxKg),
                targetShipmentDate: targetShipmentDate || undefined,
            });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to create export batch.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-purple-50/50 dark:bg-purple-900/10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Plane className="text-purple-600" size={20} />
                            Create Export Batch
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Allocate stock for shipment</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    <form id="batch-form" onSubmit={handleSubmit} className="space-y-5">

                        {/* Client Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Client / Buyer *</label>
                                <input
                                    type="text"
                                    required
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                    placeholder="e.g. Carrefour UAE"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Destination *</label>
                                <input
                                    type="text"
                                    required
                                    value={destination}
                                    onChange={e => setDestination(e.target.value)}
                                    placeholder="e.g. Dubai (DXB)"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target Shipment Date</label>
                                <input
                                    type="date"
                                    value={targetShipmentDate}
                                    onChange={e => setTargetShipmentDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Grade</label>
                                <select
                                    value={gradeLabel}
                                    onChange={e => setGradeLabel(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                >
                                    <option>Grade A</option>
                                    <option>Grade B</option>
                                    <option>Premium</option>
                                    <option>Export Class 1</option>
                                </select>
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-700" />

                        {/* Stock Selector */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Package size={16} className="text-gray-500" />
                                Select Stock Item *
                            </label>
                            {availableStock.length === 0 ? (
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-900/30 text-sm text-amber-700 dark:text-amber-400">
                                    No processed stock available. Complete a QC processing batch first.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {availableStock.map(s => {
                                        const isSelected = selectedStock?._id === s._id;
                                        return (
                                            <div
                                                key={s._id}
                                                onClick={() => setSelectedStock(isSelected ? null : s)}
                                                className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer transition-all ${
                                                    isSelected
                                                        ? 'bg-purple-50 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700'
                                                        : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-purple-300'
                                                }`}
                                            >
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                                                        {s.stockId || s._id.slice(-8).toUpperCase()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{s.cropName} · Room: {s.assignedRoom || '—'}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                        {s.processedWeightKg?.toLocaleString()} kg
                                                    </span>
                                                    {isSelected
                                                        ? <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>
                                                        : <Plus size={16} className="text-gray-400" />
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Box Configuration */}
                        {selectedStock && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 space-y-4">
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Box Configuration</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Number of Boxes *</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={boxCount}
                                            onChange={e => setBoxCount(e.target.value)}
                                            placeholder="e.g. 120"
                                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Kg per Box *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0.1"
                                            step="0.1"
                                            value={weightPerBoxKg}
                                            onChange={e => setWeightPerBoxKg(e.target.value)}
                                            placeholder="e.g. 4"
                                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold"
                                        />
                                    </div>
                                </div>
                                {boxCount && weightPerBoxKg && (
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-xs text-gray-500">Total Allocated Weight</span>
                                        <span className="text-sm font-bold text-purple-600">{totalWeightKg.toLocaleString()} kg</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="batch-form"
                        disabled={isSubmitting || !selectedStock || !clientName || !destination}
                        className={`flex-1 px-4 py-2.5 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${
                            isSubmitting || !selectedStock || !clientName || !destination
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20'
                        }`}
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={18} />}
                        {isSubmitting ? 'Creating...' : 'Create Batch'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateExportBatchModal;
