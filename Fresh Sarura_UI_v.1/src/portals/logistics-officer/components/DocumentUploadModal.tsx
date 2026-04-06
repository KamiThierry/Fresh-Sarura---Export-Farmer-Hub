import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, FileText, CheckCircle, AlertCircle, Search } from 'lucide-react';

interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    preselectedShipmentId?: string | null;
}

const DOCUMENT_TYPES = [
    { id: 'invoice', label: 'Commercial Invoice' },
    { id: 'packing_list', label: 'Packing List' },
    { id: 'phyto', label: 'Phytosanitary Certificate' },
    { id: 'awb', label: 'Airway Bill (AWB)' },
    { id: 'coo', label: 'Certificate of Origin' },
    { id: 'other', label: 'Other' },
];

const DocumentUploadModal = ({ isOpen, onClose, preselectedShipmentId }: DocumentUploadModalProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [docType, setDocType] = useState('');
    const [shipmentId, setShipmentId] = useState(preselectedShipmentId || '');
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (isOpen && preselectedShipmentId) {
            setShipmentId(preselectedShipmentId);
        }
    }, [isOpen, preselectedShipmentId]);

    if (!isOpen) return null;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        // Mock upload logic
        console.log('Uploading:', { file, docType, shipmentId });
        onClose();
        // Reset state
        setFile(null);
        setDocType('');
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload Document</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">

                    {/* File Dropzone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all
                            ${isDragging
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                        `}
                    >
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                            {file ? <CheckCircle size={24} /> : <Upload size={24} />}
                        </div>
                        {file ? (
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm">{file.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(0)} KB • Ready to upload</p>
                            </div>
                        ) : (
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG (max 10MB)</p>
                            </div>
                        )}
                    </div>

                    {/* Document Type */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 focus-within:text-indigo-600">Document Type <span className="text-red-500">*</span></label>
                        <select
                            value={docType}
                            onChange={(e) => setDocType(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="">Select Type...</option>
                            {DOCUMENT_TYPES.map(type => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Link to Shipment */}
                    <div className="relative">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Link to Shipment (Optional)</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search PL Number..."
                                value={shipmentId}
                                onChange={(e) => setShipmentId(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        {shipmentId && preselectedShipmentId === shipmentId && (
                            <div className="absolute right-3 top-[34px] text-xs text-emerald-600 font-medium flex items-center gap-1">
                                <CheckCircle size={12} /> Linked to Current Filter
                            </div>
                        )}
                    </div>

                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!file || !docType}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-md transition-colors"
                    >
                        Upload Document
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DocumentUploadModal;
