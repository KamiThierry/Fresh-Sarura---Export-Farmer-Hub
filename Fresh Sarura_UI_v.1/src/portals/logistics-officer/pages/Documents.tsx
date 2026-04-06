import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Search, Filter, Plus, Download, Printer, Eye, MoreVertical, CheckCircle, AlertCircle, Calendar, X } from 'lucide-react';
import DocumentUploadModal from '../components/DocumentUploadModal';
import Pagination from '../../shared/component/Pagination';

// Mock Data
const MOCK_DOCUMENTS = [
    { id: 'DOC-001', name: 'PL-2024-001_Invoice.pdf', type: 'Commercial Invoice', shipmentId: 'PL-2024-001', uploadedBy: 'John Doe', date: 'Oct 24, 2023 • 14:30', status: 'Verified', size: '1.2 MB' },
    { id: 'DOC-002', name: 'PL-2024-001_Phyto.pdf', type: 'Phytosanitary Cert', shipmentId: 'PL-2024-001', uploadedBy: 'Sarah Smith', date: 'Oct 24, 2023 • 10:15', status: 'Verified', size: '850 KB' },
    { id: 'DOC-003', name: 'PL-2024-002_AWB.pdf', type: 'Airway Bill', shipmentId: 'PL-2024-002', uploadedBy: 'Mike Jones', date: 'Oct 25, 2023 • 09:00', status: 'Review Needed', size: '2.4 MB' },
    { id: 'DOC-004', name: 'PL-2024-002_PackingList.pdf', type: 'Packing List', shipmentId: 'PL-2024-002', uploadedBy: 'Mike Jones', date: 'Oct 25, 2023 • 08:45', status: 'Verified', size: '150 KB' },
    { id: 'DOC-005', name: 'Standard_SOP_v2.pdf', type: 'SOP', shipmentId: null, uploadedBy: 'Admin', date: 'Oct 01, 2023 • 12:00', status: 'Verified', size: '4.5 MB' },
];

const Documents = () => {
    const [searchParams] = useSearchParams();
    const initialShipmentId = searchParams.get('shipmentId');

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterShipment, setFilterShipment] = useState(initialShipmentId || '');
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // Reset filter if URL param changes (optional, but good for deep linking handling)
    useEffect(() => {
        if (initialShipmentId) {
            setFilterShipment(initialShipmentId);
        }
    }, [initialShipmentId]);

    const filteredDocs = useMemo(() => {
        return MOCK_DOCUMENTS.filter(doc => {
            const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (doc.shipmentId && doc.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesType = filterType === 'All' || doc.type === filterType;
            const matchesShipment = !filterShipment || doc.shipmentId === filterShipment;

            return matchesSearch && matchesType && matchesShipment;
        });
    }, [searchTerm, filterType, filterShipment]);

    // Reset to page 1 whenever filters change
    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterType, filterShipment]);

    const toggleSelection = (id: string) => {
        setSelectedDocs(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedDocs.length === filteredDocs.length) {
            setSelectedDocs([]);
        } else {
            setSelectedDocs(filteredDocs.map(d => d.id));
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'Verified'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Commercial Invoice': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Phytosanitary Cert': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Airway Bill': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0 relative">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Repository</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage all export documentation centrally.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={18} />
                    Upload New Document
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full md:w-auto">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by filename, client, or PL#..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                    {/* Shipment Filter (Smart) */}
                    {filterShipment && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm border border-indigo-200 dark:border-indigo-800 whitespace-nowrap">
                            <Filter size={14} />
                            Filter: <strong>{filterShipment}</strong>
                            <button onClick={() => setFilterShipment('')} className="ml-1 hover:text-indigo-900 dark:hover:text-white"><X size={14} /></button>
                        </div>
                    )}

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="All">All Types</option>
                        <option value="Commercial Invoice">Invoices</option>
                        <option value="Phytosanitary Cert">Phyto Certs</option>
                        <option value="Airway Bill">AWBs</option>
                        <option value="Packing List">Packing Lists</option>
                    </select>


                </div>
            </div>

            {/* Master Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedDocs.length === filteredDocs.length && filteredDocs.length > 0}
                                        onChange={toggleAll}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </th>
                                <th className="px-6 py-4 font-semibold">File Name</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Linked Shipment</th>
                                <th className="px-6 py-4 font-semibold">Uploaded By</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredDocs.length > 0 ? (
                                filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(doc => (
                                    <tr
                                        key={doc.id}
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group ${selectedDocs.includes(doc.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                                    >
                                        <td className={`px-6 ${density === 'compact' ? 'py-2' : 'py-4'}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedDocs.includes(doc.id)}
                                                onChange={() => toggleSelection(doc.id)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className={`px-6 ${density === 'compact' ? 'py-2' : 'py-4'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                                    <FileText size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{doc.name}</div>
                                                    <div className="text-xs text-gray-500">{doc.size}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-6 ${density === 'compact' ? 'py-2' : 'py-4'}`}>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${getTypeColor(doc.type)}`}>
                                                {doc.type}
                                            </span>
                                        </td>
                                        <td className={`px-6 ${density === 'compact' ? 'py-2' : 'py-4'}`}>
                                            {doc.shipmentId ? (
                                                <button className="text-indigo-600 dark:text-indigo-400 hover:underline font-mono text-xs font-bold">
                                                    {doc.shipmentId}
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className={`px-6 ${density === 'compact' ? 'py-2' : 'py-4'}`}>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{doc.uploadedBy}</span>
                                        </td>
                                        <td className={`px-6 ${density === 'compact' ? 'py-2' : 'py-4'}`}>
                                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                                <Calendar size={14} className="text-gray-400" />
                                                {doc.date}
                                            </div>
                                        </td>
                                        <td className={`px-6 ${density === 'compact' ? 'py-2' : 'py-4'}`}>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                {doc.status === 'Verified' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className={`px-6 ${density === 'compact' ? 'py-2' : 'py-4'} text-right`}>
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="View">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Download">
                                                    <Download size={16} />
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="More">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                                <Search size={32} />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No documents found</h3>
                                            <p className="text-sm">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalItems={filteredDocs.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>

            {/* Bulk Action Bar (Floating Footer) */}
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${selectedDocs.length > 0 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95 pointer-events-none'}`}>
                <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-6 border border-gray-700">
                    <div className="flex items-center gap-3 pl-2 border-r border-gray-700 pr-6">
                        <span className="bg-indigo-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                            {selectedDocs.length}
                        </span>
                        <span className="font-medium text-sm">Selected</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium">
                            <Download size={16} /> Download Zip
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium">
                            <Printer size={16} /> Print Batch
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-900/50 text-red-300 rounded-lg transition-colors text-sm font-medium">
                            <X size={16} /> Delete
                        </button>
                    </div>
                    <button
                        onClick={() => setSelectedDocs([])}
                        className="ml-2 p-1 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Upload Modal */}
            <DocumentUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                preselectedShipmentId={filterShipment}
            />

        </div>
    );
};

export default Documents;
