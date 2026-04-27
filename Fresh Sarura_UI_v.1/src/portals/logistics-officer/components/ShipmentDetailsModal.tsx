import { X, FileText, Download, Upload, Eye, CheckCircle, AlertTriangle, Clock, Plane, Package, Calendar, Loader2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';

interface ShipmentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipment: any;
    onDispatched?: () => void;
}

const ShipmentDetailsModal = ({ isOpen, onClose, shipment, onDispatched }: ShipmentDetailsModalProps) => {
    const navigate = useNavigate();
    const [isDispatching, setIsDispatching] = useState(false);
    const [realDocs, setRealDocs] = useState<any[]>([]);
    const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingDocType, setPendingDocType] = useState<string | null>(null);

    // State for documents to allow mock interaction
    const [documents, setDocuments] = useState([
        { id: '1', name: 'Packing List', status: 'generated', fileName: 'PL-2024-001.pdf' },
        { id: '2', name: 'Commercial Invoice', status: 'missing', fileName: null },
        { id: '3', name: 'Phytosanitary Certificate', status: 'missing', fileName: null },
        { id: '4', name: 'Airway Bill (AWB)', status: 'uploaded', fileName: 'awb_scan_123.pdf' },
    ]);

    // Fetch real documents when shipment changes
    useEffect(() => {
        if (isOpen && shipment?._id) {
            api.get(`/export-documents?shipmentId=${shipment._id}`)
                .then(res => setRealDocs(res.data || []))
                .catch(console.error);
        }
    }, [isOpen, shipment]);

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
        navigate(`/logistics/documents?shipmentId=${shipment._id || shipment.id}`);
    };

    const handleDispatch = async () => {
        setIsDispatching(true);
        try {
            await api.patch(`/shipments/${shipment._id}/dispatch`, {});
            onDispatched?.();
            onClose();
        } catch (err) {
            console.error('Failed to dispatch:', err);
        } finally {
            setIsDispatching(false);
        }
    };

    const handleRealUpload = (docType: string) => {
        const typeMap: Record<string, string> = {
            'Packing List': 'PackingList',
            'Commercial Invoice': 'CommercialInvoice',
            'Phytosanitary Certificate': 'PhytosanitaryCert',
            'Airway Bill (AWB)': 'AWB'
        };
        setPendingDocType(typeMap[docType] || 'Other');
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !pendingDocType) return;
        setUploadingDocId(pendingDocType);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                await api.post('/export-documents', {
                    shipmentId: shipment._id,
                    docType: pendingDocType,
                    fileName: file.name,
                    fileUrl: reader.result as string,
                });
                // Refresh docs
                const res = await api.get(`/export-documents?shipmentId=${shipment._id}`);
                setRealDocs(res.data || []);
            } catch (err) {
                console.error('Upload failed:', err);
            } finally {
                setUploadingDocId(null);
                setPendingDocType(null);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
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
                                AWB: {shipment.awbNumber || '—'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-medium text-gray-900 dark:text-white">{shipment.plNumber || shipment.id}</span>
                            <span>•</span>
                            <span>{shipment.clientName || shipment.client}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</span>
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {shipment.status === 'Dispatched' ? 'Dispatched' : 'Active'}
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
                                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold mb-1">{shipment.flightNumber || '—'}</span>
                                    <div className="w-full h-0.5 bg-gray-200 dark:bg-gray-700 relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1">Direct</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{shipment.destination?.slice(0,3).toUpperCase() || '—'}</div>
                                    <div className="text-xs text-gray-400 font-bold truncate max-w-[80px]">{shipment.destination || '—'}</div>
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
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {shipment.departureDate ? new Date(shipment.departureDate).toLocaleDateString() : '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Time</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{shipment.departureTime || '—'}</span>
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
                                    <span className="block text-2xl font-bold text-gray-900 dark:text-white">{shipment.totalBoxes || 0}</span>
                                    <span className="text-xs text-gray-500">Total Boxes</span>
                                </div>
                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                                <div>
                                    <span className="block text-2xl font-bold text-gray-900 dark:text-white">{shipment.totalWeightKg || 0} <small className="text-sm font-normal text-gray-400">kg</small></span>
                                    <span className="text-xs text-gray-500">Gross Weight</span>
                                </div>
                            </div>
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
                                    {/* Hidden file input */}
                                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileSelected} />

                                    {/* Checklist logic: merge real docs with required types */}
                                    {['Packing List', 'Commercial Invoice', 'Phytosanitary Certificate', 'Airway Bill (AWB)'].map(type => {
                                        const typeMap: Record<string, string> = {
                                            'Packing List': 'PackingList',
                                            'Commercial Invoice': 'CommercialInvoice',
                                            'Phytosanitary Certificate': 'PhytosanitaryCert',
                                            'Airway Bill (AWB)': 'AWB'
                                        };
                                        const dbType = typeMap[type];
                                        const uploadedDoc = realDocs.find(d => d.docType === dbType);

                                        return (
                                            <div key={type} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                                                        ${uploadedDoc 
                                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                            : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-gray-900 dark:text-white">{type}</div>
                                                        {uploadedDoc ? (
                                                            <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                                                                <CheckCircle size={10} /> {uploadedDoc.fileName}
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                                                                <AlertTriangle size={10} /> Required
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    {uploadedDoc ? (
                                                        <button onClick={() => window.open(uploadedDoc.fileUrl)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                            <Eye size={16} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRealUpload(type)}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                                        >
                                                            {uploadingDocId === dbType ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                                            Upload PDF
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
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
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between gap-3 z-10">
                    <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                        Close
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={handleManageDocuments} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm font-bold transition-colors hover:bg-indigo-100">
                            Manage Documents
                        </button>
                        {shipment?.status === 'PackingListGenerated' && (
                            <button
                                onClick={handleDispatch}
                                disabled={isDispatching}
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                                    isDispatching
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                                }`}
                            >
                                {isDispatching ? <Loader2 size={14} className="animate-spin" /> : <Plane size={14} />}
                                {isDispatching ? 'Dispatching...' : 'Mark as Dispatched'}
                            </button>
                        )}
                        {shipment?.status === 'Dispatched' && (
                            <span className="px-4 py-2 rounded-lg text-sm font-bold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-2">
                                <CheckCircle size={14} /> Dispatched
                            </span>
                        )}
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default ShipmentDetailsModal;
