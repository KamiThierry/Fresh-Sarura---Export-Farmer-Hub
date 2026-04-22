import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Scale, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../../lib/api';

interface LogProcessingResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: {
    _id: string;
    cropName: string;
    receivedWeightKg: number;
    assignedRoom?: string;
  } | null;
  onSuccess: () => void;
}

const LogProcessingResultsModal = ({ isOpen, onClose, batch, onSuccess }: LogProcessingResultsModalProps) => {
  const [processedKg, setProcessedKg] = useState('');
  const [rejectedKg, setRejectedKg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && batch) {
      setProcessedKg('');
      setRejectedKg('');
      setError(null);
    }
  }, [isOpen, batch]);

  if (!isOpen || !batch) return null;

  const received = batch.receivedWeightKg;
  const processed = Number(processedKg) || 0;
  const rejected = Number(rejectedKg) || 0;
  const totalAccountedFor = processed + rejected;
  const variance = received - totalAccountedFor;
  const isOverAllocated = totalAccountedFor > received;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverAllocated) {
      setError(`Processed + Rejected (${totalAccountedFor} kg) cannot exceed Received (${received} kg).`);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await api.patch(`/processing-batches/${batch._id}/complete`, {
        processedWeightKg: processed,
        rejectedWeightKg: rejected,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit results.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-green-50/50 dark:bg-green-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Log Processing Results</h2>
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider mt-0.5">
                {batch.cropName} · Room {batch.assignedRoom}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Received weight — read only */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Received Weight</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{received.toLocaleString()} kg</p>
              <p className="text-xs text-gray-500 mt-0.5">This is the weight logged by the Logistics Officer.</p>
            </div>

            {/* Processed weight */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                Processed Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                max={received}
                value={processedKg}
                onChange={e => setProcessedKg(e.target.value)}
                placeholder="e.g. 1800"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1 ml-1">Weight that passed QC and is ready for cold storage / export.</p>
            </div>

            {/* Rejected weight */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                Rejected Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                max={received}
                value={rejectedKg}
                onChange={e => setRejectedKg(e.target.value)}
                placeholder="e.g. 120"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-bold placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1 ml-1">Weight that failed inspection and is discarded.</p>
            </div>

            {/* Live summary */}
            {(processedKg || rejectedKg) && (
              <div className={`p-4 rounded-2xl border ${isOverAllocated ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-600'}`}>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Summary</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-gray-400">Net Stock</p>
                    <p className="text-lg font-bold text-green-600">{processed.toLocaleString()} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Rejected</p>
                    <p className="text-lg font-bold text-red-500">{rejected.toLocaleString()} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Variance</p>
                    <p className={`text-lg font-bold ${Math.abs(variance) > 0 ? 'text-amber-500' : 'text-gray-400'}`}>
                      {variance >= 0 ? '+' : ''}{variance.toLocaleString()} kg
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !processedKg || !rejectedKg || isOverAllocated}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all ${
                isSubmitting || !processedKg || !rejectedKg || isOverAllocated
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-500 text-white active:scale-95 shadow-green-900/20'
              }`}
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {isSubmitting ? 'Submitting...' : 'Mark as Done'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default LogProcessingResultsModal;
