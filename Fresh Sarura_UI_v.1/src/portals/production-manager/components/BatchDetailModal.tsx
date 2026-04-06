import { X, Printer, Edit2, AlertOctagon } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Batch {
    id: string;
    client: string;
    dest: string;
    composition: string;
    date: string;
    status: string;
}

interface BatchDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    batch: Batch | null;
}

const BatchDetailModal = ({ isOpen, onClose, batch }: BatchDetailModalProps) => {
    if (!isOpen || !batch) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Batch {batch.id} - {batch.client}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <span className="font-semibold text-gray-600 dark:text-gray-300">Destination:</span> {batch.dest}
                            <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                            <span className="font-semibold text-gray-600 dark:text-gray-300">Date:</span> {batch.date}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content Placeholder */}
                <div className="p-8">
                    <div className="p-4 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 rounded-xl text-sm mb-6 border border-blue-100 dark:border-blue-900/50 flex flex-col gap-2">
                        <div><span className="font-bold opacity-80 uppercase tracking-wider text-xs">Composition:</span> <span className="font-medium text-base ml-1">{batch.composition}</span></div>
                        <div><span className="font-bold opacity-80 uppercase tracking-wider text-xs">Status:</span> <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-sm ml-2 mt-1">{batch.status}</span></div>
                    </div>

                    <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                        <p className="text-sm font-medium text-gray-400 text-center max-w-sm">
                            Further batch details (items included, temperature logs, QC documents) would be managed here.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-bold shadow-sm">
                            <Printer size={16} />
                            Print Labels
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm font-bold">
                            <Edit2 size={16} />
                            Edit Batch
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all text-sm font-bold shadow-sm">
                        <AlertOctagon size={16} />
                        Cancel Batch
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default BatchDetailModal;
