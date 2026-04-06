import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, QrCode, User, Scale, ShieldCheck, Plane, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

interface FindBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FindBatchModal = ({ isOpen, onClose }: FindBatchModalProps) => {
    const [view, setView] = useState<'search' | 'timeline'>('search');
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    if (!isOpen) return null;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        // Simulate API search
        setTimeout(() => {
            setIsSearching(false);
            setView('timeline');
        }, 1000);
    };

    const resetSearch = () => {
        setView('search');
        setQuery('');
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Search className="text-orange-600" size={20} />
                            Traceability Lookup
                        </h2>
                        <p className="text-xs text-gray-500">Track produce journey from farm to export</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">

                    {/* View 1: Search */}
                    {view === 'search' && (
                        <div className="p-8 h-full flex flex-col justify-center items-center text-center">
                            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6">
                                <QrCode size={40} className="text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Track a Batch
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
                                Enter the Batch ID found on the crate label or shipping documents.
                            </p>

                            <form onSubmit={handleSearch} className="w-full max-w-sm space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter Batch ID (e.g. B-2026-001)"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-center text-lg font-medium tracking-wide uppercase"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!query.trim() || isSearching}
                                    className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-900/20 disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isSearching ? 'Searching...' : 'Trace Journey'}
                                </button>
                            </form>

                            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 w-full max-w-xs">
                                <button className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors mx-auto">
                                    <QrCode size={16} />
                                    Scan QR Code via Camera
                                </button>
                            </div>
                        </div>
                    )}

                    {/* View 2: Timeline */}
                    {view === 'timeline' && (
                        <div className="p-0">
                            {/* Result Header */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 border-b border-orange-100 dark:border-orange-800/30">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                                        Batch Found
                                    </span>
                                    <button onClick={resetSearch} className="text-xs text-gray-500 underline">
                                        New Search
                                    </button>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {query.toUpperCase() || "B-2026-001"}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                                        <CheckCircle2 size={12} /> VERIFIED
                                    </span>
                                    <span className="text-xs text-gray-500">Updated: Just now</span>
                                </div>
                            </div>

                            {/* Vertical Timeline */}
                            <div className="p-6">
                                <div className="relative pl-14 border-l-2 border-dashed border-gray-200 dark:border-gray-700 space-y-12">

                                    {/* Step 1 */}
                                    <div className="relative">
                                        <div className="absolute -left-[49px] bg-white dark:bg-gray-800 p-1">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border-4 border-white dark:border-gray-800">
                                                <User size={18} />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Harvested by Jean Claude</h4>
                                            <p className="text-xs text-gray-500 mt-1">Rwamagana, Sector F4</p>
                                            <p className="text-xs font-medium text-gray-400 mt-0.5">12 Jan, 08:00 AM</p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="relative">
                                        <div className="absolute -left-[49px] bg-white dark:bg-gray-800 p-1">
                                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 border-4 border-white dark:border-gray-800">
                                                <Scale size={18} />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Received at Hub</h4>
                                            <p className="text-xs text-gray-500 mt-1">Fresh Sarura Center - Kigali</p>
                                            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">500 KG</span>
                                            </div>
                                            <p className="text-xs font-medium text-gray-400 mt-1.5">12 Jan, 10:30 AM</p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="relative">
                                        <div className="absolute -left-[49px] bg-white dark:bg-gray-800 p-1">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 border-4 border-white dark:border-gray-800">
                                                <ShieldCheck size={18} />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Passed QC Inspection</h4>
                                            <p className="text-xs text-gray-500 mt-1">Inspector: Sarah M.</p>
                                            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-100 dark:border-purple-800/30">
                                                <span className="text-xs font-bold">Grade A (98%)</span>
                                            </div>
                                            <p className="text-xs font-medium text-gray-400 mt-1.5">12 Jan, 02:15 PM</p>
                                        </div>
                                    </div>

                                    {/* Step 4 (Current) */}
                                    <div className="relative">
                                        <div className="absolute -left-[49px] bg-white dark:bg-gray-800 p-1">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 border-4 border-white dark:border-gray-800 animate-pulse">
                                                <Plane size={18} />
                                            </div>
                                        </div>
                                        <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-800/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-sm font-bold text-orange-800 dark:text-orange-300">Scheduled for Export</h4>
                                                <span className="text-[10px] font-bold uppercase bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded">Current</span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Flight WB300 • RwandAir</p>
                                            <div className="flex items-center gap-2 mt-3 text-sm font-medium text-gray-900 dark:text-white">
                                                <span>KGL</span>
                                                <ArrowRight size={14} className="text-gray-400" />
                                                <span>DXB (Dubai)</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Footer Report Action */}
                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 mt-4">
                                <button className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <FileText size={18} />
                                    Download Full Traceability Report
                                </button>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>,
        document.body
    );
};

export default FindBatchModal;
