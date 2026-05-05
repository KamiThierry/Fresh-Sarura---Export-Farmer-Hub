import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plane, Package, Plus, Trash2, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';

interface StockItem {
    _id: string;
    stockId: string;
    cropName: string;
    processedWeightKg: number;
    assignedRoom?: string;
    gradeLabel?: string;
}

interface SelectedLine {
    stockItem: StockItem;
    allocateKg: number;
    boxCount: number;
    weightPerBoxKg: number;
    error?: string;
}

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
    const [selectedLines, setSelectedLines] = useState<SelectedLine[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setClientName('');
            setDestination('');
            setTargetShipmentDate('');
            setGradeLabel('Grade A');
            setSelectedLines([]);
            setSubmitError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Only show available stock (not fully allocated, must have STK- id)
    const availableStock: StockItem[] = stock
        .filter((s: any) => s.stockId && s.stockId.startsWith('STK-'))
        .map((s: any) => ({
            _id: s._id,
            stockId: s.stockId,
            cropName: s.cropName,
            processedWeightKg: s.processedWeightKg || 0,
            assignedRoom: s.assignedRoom,
            gradeLabel: s.gradeLabel || 'Grade A',
        }));

    // Compute how much is already allocated per stock item from selectedLines
    const getAllocatedForStock = (stockId: string) =>
        selectedLines.find(l => l.stockItem.stockId === stockId)?.allocateKg || 0;

    const isSelected = (stockId: string) =>
        selectedLines.some(l => l.stockItem.stockId === stockId);

    const handleAddLine = (item: StockItem) => {
        if (isSelected(item.stockId)) return;
        setSelectedLines(prev => [...prev, {
            stockItem: item,
            allocateKg: item.processedWeightKg, // default to full, PM can reduce
            boxCount: 1,
            weightPerBoxKg: item.processedWeightKg,
        }]);
    };

    const handleRemoveLine = (stockId: string) => {
        setSelectedLines(prev => prev.filter(l => l.stockItem.stockId !== stockId));
    };

    const handleLineChange = (stockId: string, field: keyof SelectedLine, value: number) => {
        setSelectedLines(prev => prev.map(l => {
            if (l.stockItem.stockId !== stockId) return l;
            const updated = { ...l, [field]: value };
            // Validate allocateKg
            if (field === 'allocateKg') {
                if (value <= 0) {
                    updated.error = 'Must be greater than 0';
                } else if (value > l.stockItem.processedWeightKg) {
                    updated.error = `Max available: ${l.stockItem.processedWeightKg} kg`;
                } else {
                    updated.error = undefined;
                }
                // Auto-update weightPerBoxKg if boxCount is set
                if (updated.boxCount > 0) {
                    updated.weightPerBoxKg = parseFloat((value / updated.boxCount).toFixed(2));
                }
            }
            if (field === 'boxCount') {
                if (updated.allocateKg > 0 && value > 0) {
                    updated.weightPerBoxKg = parseFloat((updated.allocateKg / value).toFixed(2));
                }
            }
            return updated;
        }));
    };

    const totalAllocatedKg = selectedLines.reduce((sum, l) => sum + (l.allocateKg || 0), 0);
    const hasErrors = selectedLines.some(l => l.error);
    const canSubmit = clientName && destination && targetShipmentDate && selectedLines.length > 0 && !hasErrors && !isSubmitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setIsSubmitting(true);
        setSubmitError('');
        try {
            // One POST per selected stock line
            await Promise.all(selectedLines.map(line =>
                api.post('/export-batches', {
                    processingBatchId: line.stockItem._id,
                    cycleId: undefined, // backend can get from processingBatch if needed
                    cropName: line.stockItem.cropName,
                    clientName,
                    destination,
                    gradeLabel,
                    allocatedWeightKg: line.allocateKg,
                    boxCount: line.boxCount,
                    weightPerBoxKg: line.weightPerBoxKg,
                    targetShipmentDate,
                })
            ));
            onSuccess();
            onClose();
        } catch (err: any) {
            setSubmitError(err?.message || 'Failed to create export batch. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-purple-50/50 dark:bg-purple-900/10 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Plane className="text-purple-600" size={20} />
                            Create Export Batch
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Allocate stock for shipment — select one or more stock items
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Client + Destination */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Client / Buyer *
                            </label>
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Destination *
                            </label>
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

                    {/* Date + Grade */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Target Shipment Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={targetShipmentDate}
                                onChange={e => setTargetShipmentDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Grade
                            </label>
                            <select
                                value={gradeLabel}
                                onChange={e => setGradeLabel(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option>Grade A</option>
                                <option>Grade B</option>
                            </select>
                        </div>
                    </div>

                    <hr className="border-gray-100 dark:border-gray-700" />

                    {/* Stock selector */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Package size={16} className="text-gray-500" />
                                Select Stock Items *
                            </label>
                            {totalAllocatedKg > 0 && (
                                <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded font-medium">
                                    Total: {totalAllocatedKg.toLocaleString()} kg across {selectedLines.length} item{selectedLines.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {/* Available stock list */}
                        <div className="space-y-2 mb-4">
                            {availableStock.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-6">No available stock items found.</p>
                            )}
                            {availableStock.map(item => {
                                const selected = isSelected(item.stockId);
                                return (
                                    <div
                                        key={item.stockId}
                                        className={`p-3 rounded-lg border transition-all ${
                                            selected
                                                ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                                                    {item.stockId}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {item.cropName} · {item.gradeLabel} · {item.assignedRoom || 'No room'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                                    {item.processedWeightKg.toLocaleString()} kg
                                                </span>
                                                {!selected ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddLine(item)}
                                                        className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-500 hover:text-purple-600 transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveLine(item.stockId)}
                                                        className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded allocation inputs when selected */}
                                        {selected && (() => {
                                            const line = selectedLines.find(l => l.stockItem.stockId === item.stockId)!;
                                            return (
                                                <div className="mt-3 pt-3 border-t border-purple-100 dark:border-purple-800/30 grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                                                            Allocate (kg) *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={item.processedWeightKg}
                                                            value={line.allocateKg}
                                                            onChange={e => handleLineChange(item.stockId, 'allocateKg', parseFloat(e.target.value) || 0)}
                                                            className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-900 ${
                                                                line.error
                                                                    ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                                                                    : 'border-gray-200 dark:border-gray-700 bg-white'
                                                            }`}
                                                        />
                                                        {line.error && (
                                                            <p className="text-[11px] text-red-500 mt-0.5 flex items-center gap-1">
                                                                <AlertCircle size={10} />
                                                                {line.error}
                                                            </p>
                                                        )}
                                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                                            Max: {item.processedWeightKg} kg
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                                                            Box Count *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={line.boxCount}
                                                            onChange={e => handleLineChange(item.stockId, 'boxCount', parseInt(e.target.value) || 1)}
                                                            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white dark:bg-gray-900"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                                                            Kg / Box
                                                        </label>
                                                        <input
                                                            type="number"
                                                            readOnly
                                                            value={line.weightPerBoxKg}
                                                            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500"
                                                        />
                                                        <p className="text-[10px] text-gray-400 mt-0.5">Auto-calculated</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit error */}
                    {submitError && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-sm text-red-600 dark:text-red-400">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            {submitError}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="flex-1 px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating {selectedLines.length} batch{selectedLines.length !== 1 ? 'es' : ''}...
                            </>
                        ) : (
                            <>
                                Create {selectedLines.length > 1 ? `${selectedLines.length} Batches` : 'Batch'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateExportBatchModal;
