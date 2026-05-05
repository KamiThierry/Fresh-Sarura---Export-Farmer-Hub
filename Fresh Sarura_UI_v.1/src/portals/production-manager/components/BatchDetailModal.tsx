import { useState, useEffect } from 'react';
import { X, Printer, CheckCircle2, Loader2, Package, MapPin, Calendar, Tag, Weight, Plane } from 'lucide-react';
import { createPortal } from 'react-dom';
import { api } from '../../../lib/api';

interface BatchDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    batch: any | null;
    onStatusChange?: () => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    Pending:        { label: 'Pending',           color: 'text-purple-700', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    ReadyForExport: { label: 'Ready for Export',  color: 'text-green-700',  bg: 'bg-green-50  dark:bg-green-900/30'  },
    Shipped:        { label: 'Shipped',           color: 'text-blue-700',   bg: 'bg-blue-50   dark:bg-blue-900/30'   },
};

const BatchDetailModal = ({ isOpen, onClose, batch, onStatusChange }: BatchDetailModalProps) => {
    const [isMarking, setIsMarking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [linkedShipment, setLinkedShipment] = useState<any>(null);

    useEffect(() => {
        if (isOpen && batch?._id) {
            api.get('/shipments').then(res => {
                const all = res.data?.data || res.data || [];
                const found = all.find((s: any) =>
                    s.exportBatches?.some((b: any) => (b._id || b) === batch._id)
                );
                setLinkedShipment(found || null);
            }).catch(console.error);
        }
    }, [isOpen, batch]);

    if (!isOpen || !batch) return null;

    const cfg = statusConfig[batch.status] || statusConfig.Pending;

    const handleMarkReady = async () => {
        setIsMarking(true);
        setError(null);
        try {
            await api.patch(`/export-batches/${batch._id}/ready`, {});
            onStatusChange?.();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to mark as ready.');
        } finally {
            setIsMarking(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-purple-50/50 dark:bg-purple-900/10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{batch.batchId}</h2>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                                {cfg.label}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Export Batch Details</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: Package, label: 'Crop', value: batch.cropName },
                            { icon: Tag, label: 'Grade', value: batch.gradeLabel || 'Grade A' },
                            { icon: MapPin, label: 'Client', value: batch.clientName },
                            { icon: MapPin, label: 'Destination', value: batch.destination },
                            { icon: Weight, label: 'Total Weight', value: `${batch.allocatedWeightKg?.toLocaleString()} kg` },
                            { icon: Package, label: 'Boxes', value: `${batch.boxCount} × ${batch.weightPerBoxKg} kg` },
                            { icon: Calendar, label: 'Target Date', value: batch.targetShipmentDate ? new Date(batch.targetShipmentDate).toLocaleDateString() : '—' },
                            { icon: Calendar, label: 'Created', value: new Date(batch.createdAt).toLocaleDateString() },
                        ].map((row, i) => (row.value &&
                            <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3">
                                <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                                    <row.icon size={11} /> {row.label}
                                </p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{row.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Shipment Info */}
                    {linkedShipment && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-4 py-3 border border-indigo-100 dark:border-indigo-900/30">
                            <p className="text-xs text-indigo-500 font-medium mb-1 flex items-center gap-1">
                                <Plane size={11} /> Assigned to Shipment
                            </p>
                            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400 font-mono">
                                {linkedShipment.plNumber}
                            </p>
                            <p className="text-xs text-indigo-500 mt-0.5">
                                {linkedShipment.flightNumber} → {linkedShipment.destination} ·{' '}
                                {new Date(linkedShipment.departureDate).toLocaleDateString()}
                            </p>
                            <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                linkedShipment.status === 'Shipped'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                                {linkedShipment.status === 'Shipped' ? '✈ Shipped' : '📋 Scheduled'}
                            </span>
                        </div>
                    )}

                    {/* Stock reference */}
                    {batch.processingBatchId && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3">
                            <p className="text-xs text-gray-400 font-medium mb-1">Stock Reference</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                                {batch.processingBatchId?.stockId || batch.processingBatchId?._id || '—'}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 text-sm font-bold shadow-sm transition-colors"
                    >
                        <Printer size={16} /> Print Labels
                    </button>

                    {batch.status === 'Pending' && (
                        <button
                            onClick={handleMarkReady}
                            disabled={isMarking}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${
                                isMarking
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20'
                            }`}
                        >
                            {isMarking ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            {isMarking ? 'Updating...' : 'Mark as Ready for Export'}
                        </button>
                    )}

                    {batch.status === 'ReadyForExport' && (
                        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/30">
                            <CheckCircle2 size={16} /> Ready for Export
                        </span>
                    )}

                    {batch.status === 'Shipped' && (
                        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">
                            <CheckCircle2 size={16} /> Shipped
                        </span>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default BatchDetailModal;
