import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ClipboardCheck, AlertTriangle } from 'lucide-react';

export interface QCInspectionData {
    intakeId: string;
    supplier: string;
    crop: string;
    grossWeight: number;
}

interface RecordQCModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: QCInspectionData | null;
    onSubmit?: (result: any) => void;
}

const defectTypes = [
    'None',
    'Pest Damage',
    'Bruising (Mechanical)',
    'Undersized',
    'Coloration'
];

const gradeOptions = [
    'Grade A (Export)',
    'Grade B (Local Market)',
    'Rejected (Disposal)'
];

const inputClass =
    'w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder:text-gray-400';
const labelClass = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5';

const RecordQCModal = ({ isOpen, onClose, data, onSubmit }: RecordQCModalProps) => {
    const [rejectedWeight, setRejectedWeight] = useState<string>('');
    const [defectType, setDefectType] = useState<string>('None');
    const [sampleSize, setSampleSize] = useState<string>('');
    const [grade, setGrade] = useState<string>('Grade A (Export)');
    const [isFocused, setIsFocused] = useState(false);

    // Reset state when opened with new data
    useEffect(() => {
        if (isOpen) {
            setRejectedWeight('');
            setDefectType('None');
            setSampleSize('');
            setGrade('Grade A (Export)');
        }
    }, [isOpen, data]);

    if (!isOpen || !data) return null;

    // Calculation
    const grossVal = data.grossWeight || 0;
    const rejVal = parseFloat(rejectedWeight) || 0;
    const netWeight = Math.max(0, grossVal - rejVal);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.({
            intakeId: data.intakeId,
            rejectedWeight: rejVal,
            defectType,
            sampleSize: parseFloat(sampleSize) || 0,
            grade,
            netWeight,
        });
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Card */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <ClipboardCheck size={22} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record Quality Inspection</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Context Banner */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-xl mb-6 flex flex-wrap justify-between items-center text-sm border border-blue-100 dark:border-blue-800/30 gap-2">
                        <div className="text-blue-800 dark:text-blue-300 font-medium">
                            <span className="font-bold">Intake ID:</span> {data.intakeId} <span className="opacity-50 mx-1">|</span> {data.supplier}
                        </div>
                        <div className="text-blue-800 dark:text-blue-300 font-medium tracking-wide">
                            <span className="font-bold">Crop:</span> {data.crop} <span className="opacity-50 mx-1">|</span> <span className="font-bold">Gross Weight:</span> {data.grossWeight.toLocaleString()} kg
                        </div>
                    </div>

                    <form id="record-qc-form" onSubmit={handleSubmit}>

                        {/* Section 1: Metrics */}
                        <div className="mb-6">
                            <p className="text-[10.5px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertTriangle size={12} />
                                Defect &amp; Rejection Metrics
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Field 1: Rejected Weight */}
                                <div>
                                    <label className={labelClass}>Rejected Weight</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max={data.grossWeight}
                                            step="0.1"
                                            value={rejectedWeight}
                                            onChange={(e) => setRejectedWeight(e.target.value)}
                                            onFocus={() => setIsFocused(true)}
                                            onBlur={() => setIsFocused(false)}
                                            placeholder="0"
                                            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 ${isFocused || Number(rejectedWeight) > 0
                                                    ? 'border-red-300 focus:ring-2 focus:ring-red-500/50 dark:border-red-700/50'
                                                    : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-200'
                                                } pr-12`}
                                        />
                                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold pointer-events-none ${isFocused || Number(rejectedWeight) > 0 ? 'text-red-500' : 'text-gray-400'
                                            }`}>
                                            kg
                                        </span>
                                    </div>
                                </div>

                                {/* Field 2: Primary Defect Type */}
                                <div>
                                    <label className={labelClass}>Primary Defect Type</label>
                                    <select
                                        value={defectType}
                                        onChange={(e) => setDefectType(e.target.value)}
                                        className={inputClass}
                                    >
                                        {defectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                {/* Field 3: Sample Size */}
                                <div>
                                    <label className={labelClass}>Sample Size Inspected (Optional)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={sampleSize}
                                            onChange={(e) => setSampleSize(e.target.value)}
                                            placeholder="10"
                                            className={`${inputClass} pr-10`}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">
                                            %
                                        </span>
                                    </div>
                                </div>

                                {/* Field 4: Assigned Grade */}
                                <div>
                                    <label className={labelClass}>Assigned Grade</label>
                                    <select
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        className={`${inputClass} font-semibold ${grade.includes('Export') ? 'text-green-700 dark:text-green-400' :
                                                grade.includes('Rejected') ? 'text-red-700 dark:text-red-400' :
                                                    'text-blue-700 dark:text-blue-400'
                                            }`}
                                    >
                                        {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Net Calculation */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-5 mb-2 mt-8">
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 p-5 rounded-2xl flex justify-between items-center">
                                <div>
                                    <h3 className="text-green-800 dark:text-green-400 font-bold text-sm tracking-wide">Net Approved Stock</h3>
                                    <p className="text-green-600/80 dark:text-green-500/80 text-xs mt-0.5">Calculated: Gross ({grossVal} kg) - Rejected ({rejVal || 0} kg)</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-3xl font-black text-green-700 dark:text-green-400 tracking-tight">
                                        {netWeight.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg
                                    </span>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* ── Footer ── */}
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="record-qc-form"
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-[0.98] transition-all shadow-sm shadow-green-900/20"
                    >
                        Complete Inspection &amp; Send to Stock
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RecordQCModal;
