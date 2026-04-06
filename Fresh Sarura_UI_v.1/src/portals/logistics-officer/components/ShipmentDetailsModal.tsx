
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, FileText, Download, Upload, Eye, CheckCircle, AlertTriangle, Clock, Plane, Package, Calendar } from 'lucide-react';

interface ShipmentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipment: any; // We'll type this properly based on usage
}

const ShipmentDetailsModal = ({ isOpen, onClose, shipment }: ShipmentDetailsModalProps) => {
    const navigate = useNavigate();

    // State for documents to allow mock interaction
    const [documents, setDocuments] = useState([
        { id: '1', name: 'Packing List', status: 'generated', fileName: 'PL-2024-001.pdf' },
        { id: '2', name: 'Commercial Invoice', status: 'missing', fileName: null },
        { id: '3', name: 'Phytosanitary Certificate', status: 'missing', fileName: null },
        { id: '4', name: 'Airway Bill (AWB)', status: 'uploaded', fileName: 'awb_scan_123.pdf' },
    ]);

    if (!isOpen || !shipment) return null;

    const handleUpload = (id: string) => {
        setDocuments(prev => prev.map(doc => {
            if (doc.id === id) {
                return { ...doc, status: 'uploaded', fileName: 'scanned_doc_v1.pdf' };
            }
            return doc;
        }));
    };

    const handleManageDocuments = () => {
        onClose();
        navigate(`/logistics/documents?shipmentId=${shipment.id}`);
    };

    // Mock Audit Log
    const auditLog = [
        { time: 'Today, 09:00', event: 'Flight WB300 Departed KGL', icon: <Plane size={14} /> },
        { time: 'Yesterday, 16:30', event: 'Phyto Cert uploaded by John D.', icon: <Upload size={14} /> },
        { time: 'Yesterday, 14:00', event: 'Packing List generated automatically', icon: <FileText size={14} /> },
        { time: 'Yesterday, 10:15', event: 'Shipment created', icon: <Clock size={14} /> },
    ];

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipment Details</h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-mono font-medium">
                                AWB: 123-4567-890
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-medium text-gray-900 dark:text-white">{shipment.id}</span>
                            <span>•</span>
                            <span>{shipment.client}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</span>
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                In-Transit
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-900/50">

                    {/* Section 1: Trip Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* Route Card */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-gray-500 text-xs font-medium uppercase tracking-wider">
                                <Plane size={14} /> Route Info
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">KGL</div>
                                    <div className="text-xs text-gray-400">Kigali</div>
                                </div>
                                <div className="flex-1 flex flex-col items-center px-4">
                                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold mb-1">{shipment.flight || 'WB300'}</span>
                                    <div className="w-full h-0.5 bg-gray-200 dark:bg-gray-700 relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1">{shipment.duration || '8h 30m'}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">LHR</div>
                                    <div className="text-xs text-gray-400">London</div>
                                </div>
                            </div>
                        </div>

                        {/* Timing Card */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-gray-500 text-xs font-medium uppercase tracking-wider">
                                <Calendar size={14} /> Schedule
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Departure</span>
                                    <span className="font-bold text-gray-900 dark:text-white">Oct 24, 09:00</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Arrival (Est)</span>
                                    <span className="font-bold text-gray-900 dark:text-white">Oct 24, 18:30</span>
                                </div>
                            </div>
                        </div>

                        {/* Cargo Card */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-gray-500 text-xs font-medium uppercase tracking-wider">
                                <Package size={14} /> Cargo Check
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <div>
                                    <span className="block text-2xl font-bold text-gray-900 dark:text-white">{shipment.boxes || 0}</span>
                                    <span className="text-xs text-gray-500">Total Boxes</span>
                                </div>
                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                                <div>
                                    <span className="block text-2xl font-bold text-gray-900 dark:text-white">{shipment.weight || 0} <small className="text-sm font-normal text-gray-400">kg</small></span>
                                    <span className="text-xs text-gray-500">Gross Weight</span>
                                </div>
                            </div>

                            {/* Commodities Tags */}
                            {shipment.commodities && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {shipment.commodities.map((item: string, idx: number) => (
                                        <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-[10px] font-medium rounded-full border border-gray-200 dark:border-gray-600/50">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* Section 2: Document Checklist (Left - 60%) */}
                        <div className="flex-1">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-indigo-600" />
                                Required Export Documents
                            </h3>
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {documents.map(doc => (
                                        <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                                                    ${doc.status === 'generated' || doc.status === 'uploaded'
                                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                        : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-gray-900 dark:text-white">{doc.name}</div>
                                                    {doc.fileName ? (
                                                        <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                                                            <CheckCircle size={10} />
                                                            {doc.fileName}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                                                            <AlertTriangle size={10} />
                                                            Required
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                {doc.status === 'generated' && (
                                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                                        <Download size={14} /> Download
                                                    </button>
                                                )}
                                                {doc.status === 'missing' && (
                                                    <button
                                                        onClick={() => handleUpload(doc.id)}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                                    >
                                                        <Upload size={14} /> Upload PDF
                                                    </button>
                                                )}
                                                {doc.status === 'uploaded' && (
                                                    <div className="flex gap-2">
                                                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                            <Eye size={16} />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Audit Log (Right - 40%) */}
                        <div className="w-full lg:w-96">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Clock size={18} className="text-gray-400" />
                                Shipment Log
                            </h3>
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm h-fit">
                                <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-8">
                                    {auditLog.map((log, index) => (
                                        <div key={index} className="relative pl-6">
                                            <div className="absolute -left-[13px] top-0 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 z-10">
                                                {log.icon}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-400 uppercase mb-1">{log.time}</span>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{log.event}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3 z-10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleManageDocuments}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-md transition-colors"
                    >
                        Manage Documents
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default ShipmentDetailsModal;
