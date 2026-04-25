import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, XCircle as XCircleIcon, ShieldCheck, Box, Thermometer, Plane, Download, ExternalLink, AlertTriangle, CheckCircle, XCircle, Clock, Printer, FileCheck, User, Loader2 } from 'lucide-react';
import { api } from '../../../lib/api';

const Traceability = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'tracer' | 'compliance'>('tracer');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchActive, setSearchActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [traceData, setTraceData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [certFilter, setCertFilter] = useState<{ farmerName: string; certLabel: string } | null>(null);

    // Read URL search params on mount / when URL changes
    useEffect(() => {
        const farmerId = searchParams.get('farmerId');
        const farmerName = searchParams.get('farmerName');
        const docType = searchParams.get('docType');
        const certLabel = searchParams.get('certLabel');
        if (farmerId && docType === 'Certification') {
            setActiveTab('compliance');
            setCertFilter({ farmerName: farmerName ?? '', certLabel: certLabel ?? '' });
        }
    }, [searchParams]);

    // Full certificate dataset — covers all farmers + packhouse
    const allCertificates = [
        { farmerId: 1, entity: 'Farmer: Jean Claude', type: 'GlobalG.A.P.', id: 'GGN-10001', status: 'Active', expiry: '2026-10-12' },
        { farmerId: 1, entity: 'Farmer: Jean Claude', type: 'Organic RW', id: 'ORG-10001', status: 'Active', expiry: '2027-01-15' },
        { farmerId: 2, entity: 'Farmer: Kirehe Co-op', type: 'GlobalG.A.P.', id: 'GGN-20001', status: 'Active', expiry: '2026-09-30' },
        { farmerId: 2, entity: 'Farmer: Kirehe Co-op', type: 'Fair Trade', id: 'FT-20002', status: 'Active', expiry: '2026-11-01' },
        { farmerId: 2, entity: 'Farmer: Kirehe Co-op', type: 'Rainforest Alliance', id: 'RA-20003', status: 'Expiring', expiry: '2026-03-10' },
        { farmerId: 3, entity: 'Farmer: Marie Claire', type: 'Organic RW', id: 'ORG-30001', status: 'Expiring', expiry: '2026-02-10' },
        { farmerId: 4, entity: 'Farmer: Bugesera Outgrowers', type: 'GlobalG.A.P.', id: 'GGN-40001', status: 'Active', expiry: '2026-08-20' },
        { farmerId: 5, entity: 'Farmer: Robert / Almond', type: 'GlobalG.A.P.', id: 'GGN-50001', status: 'Pending', expiry: '-' },
        { farmerId: 5, entity: 'Farmer: Robert / Almond', type: 'Organic RW', id: 'ORG-50002', status: 'Active', expiry: '2027-03-01' },
        { farmerId: 6, entity: 'Farmer: Rusizi Organic', type: 'GlobalG.A.P.', id: 'GGN-60001', status: 'Active', expiry: '2026-12-31' },
        { farmerId: 6, entity: 'Farmer: Rusizi Organic', type: 'Organic RW', id: 'ORG-60002', status: 'Active', expiry: '2027-06-15' },
        { farmerId: 6, entity: 'Farmer: Rusizi Organic', type: 'ISO 22000', id: 'ISO-60003', status: 'Active', expiry: '2027-09-01' },
        { farmerId: 0, entity: 'Packhouse: Kigali Central', type: 'SMETA', id: 'ZC-98765', status: 'Active', expiry: '2025-12-01' },
        { farmerId: 0, entity: 'Company: Fresh Sarura Ltd', type: 'NAEB Export License', id: 'NAEB-2026', status: 'Active', expiry: '2026-06-30' },
    ];

    const complianceData = {
        alerts: [
            { id: 1, message: '2 Farmer Certificates expiring soon (Kirehe Co-op — Rainforest Alliance, Marie Claire — Organic RW)', type: 'critical' },
            { id: 2, message: 'Packhouse Hygiene Audit due in 5 days', type: 'warning' },
        ],
        permits: [
            { name: 'NAEB Export License 2026', renewal: '2026-06-30', status: 'Active' },
            { name: 'Phytosanitary Import Permit (EU)', renewal: '2026-03-15', status: 'Active' },
        ],
    };

    const filteredAlerts = certFilter
        ? complianceData.alerts.filter((a) => a.message.toLowerCase().includes(certFilter.farmerName.toLowerCase()))
        : complianceData.alerts;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchTerm.trim().toUpperCase();
        if (!trimmed) return;

        setIsLoading(true);
        setError(null);
        setSearchActive(true);
        setTraceData(null);
        try {
            const res = await api.get(`/traceability/${trimmed}`);
            // Backend returns { status: 'success', data: { batchId, nodes } }
            // api utility may unwrap one level, so try both
            setTraceData(res.data?.data || res.data);
        } catch (err: any) {
            console.error('Search failed:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to fetch traceability data. Ensure the Batch ID is correct.';
            setError(msg);
            setTraceData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'source':   return User;
            case 'intake':   return ShieldCheck;
            case 'stock':    return Box;
            case 'export':   return Plane;
            case 'shipment': return Plane;   // ← add this
            default:         return Clock;
        }
    };

    const getNodeColor = (type: string) => {
        switch (type) {
            case 'source':   return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
            case 'intake':   return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'stock':    return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            case 'export':   return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
            case 'shipment': return 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400';   // ← add this
            default:         return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Traceability & Compliance</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track product journeys and manage compliance safeguards.</p>
                </div>

                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex items-center">
                    <button
                        onClick={() => setActiveTab('tracer')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'tracer'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Product Tracer
                    </button>
                    <button
                        onClick={() => setActiveTab('compliance')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'compliance'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Compliance Manager
                    </button>
                </div>
            </div>

            {activeTab === 'tracer' && (
                <div className="animate-fade-in">
                    <div className="mb-12 sticky top-5 z-20">
                        <div className="relative max-w-2xl mx-auto shadow-2xl shadow-blue-900/20 rounded-2xl">
                            <form onSubmit={handleSearch} className="relative flex">
                                <div className="relative flex-1">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                                    <input
                                        type="text"
                                        placeholder="Enter Batch ID (e.g., EB-XXXXXX)..."
                                        className="w-full pl-14 pr-4 py-5 rounded-l-2xl bg-white dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 text-lg shadow-sm outline-none dark:text-white transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isLoading && <Loader2 size={20} className="animate-spin" />}
                                    Search
                                </button>
                                <button
                                    type="button"
                                    className="hidden md:flex items-center gap-2 px-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-r-2xl border-l border-gray-200 dark:border-gray-600 transition-colors"
                                >
                                    <Printer size={20} />
                                    <span className="text-sm">Export<br />Audit Rpt</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {!searchActive && (
                        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
                            <div className="bg-gray-100 dark:bg-gray-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={40} className="opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Ready to Track</h3>
                            <p className="max-w-md mx-auto">Enter a Batch ID (Export or Stock) to visualize the complete product journey.</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 size={40} className="animate-spin text-blue-600" />
                            <p className="text-gray-500 font-medium">Reconstructing Batch Lifecycle...</p>
                        </div>
                    )}

                    {error && (
                        <div className="max-w-md mx-auto p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800 text-center animate-fade-in">
                            <XCircle className="text-red-500 mx-auto mb-3" size={32} />
                            <h3 className="text-red-900 dark:text-red-200 font-bold mb-1">Search Failed</h3>
                            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {(searchActive && !isLoading && traceData) && (
                        <div className="relative max-w-3xl mx-auto animate-fade-in-up">
                            <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-orange-500 opacity-30 dark:opacity-50 hidden md:block"></div>

                            <div className="space-y-8">
                                {(traceData?.nodes || []).map((node: any, index: number) => {
                                    const Icon = getNodeIcon(node.type);
                                    return (
                                        <div key={node.id} className="relative flex flex-col md:flex-row gap-6 group">
                                            <div className="flex-shrink-0 relative z-10 flex flex-col items-center md:items-start">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300 ${getNodeColor(node.type)} border-4 border-white dark:border-gray-900`}>
                                                    <Icon size={32} />
                                                </div>
                                                {index !== (traceData?.nodes?.length ?? 0) - 1 && (
                                                    <div className="h-full w-0.5 bg-gray-200 dark:bg-gray-700 my-2 md:hidden"></div>
                                                )}
                                            </div>

                                            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                            {node.title}
                                                        </h3>
                                                        <span className="text-xs font-mono text-gray-400">Step {index + 1}</span>
                                                    </div>

                                                    {node.badges && (
                                                        <div className="flex flex-col gap-1 items-end">
                                                            {node.badges.map((badge: any, idx: number) => (
                                                                <span key={idx} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-current ${badge.value === 'Valid' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 bg-gray-50' }`}>
                                                                    <CheckCircle size={12} />
                                                                    {badge.label}: {badge.value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm mb-5">
                                                    {node.details.map((detail: any, i: number) => (
                                                        <div key={i} className="flex flex-col">
                                                            <span className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">{detail.label}</span>
                                                            <span className={`font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5 ${detail.highlight || ''}`}>
                                                                {detail.icon && <detail.icon size={14} />} {detail.value}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {node.action && (
                                                    <button 
                                                        onClick={() => node.action.link && navigate(node.action.link)}
                                                        className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline"
                                                    >
                                                        <ExternalLink size={16} />
                                                        {node.action.label}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-3 mt-8 md:pl-20 text-gray-400 justify-center md:justify-start">
                                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                <span className="text-xs font-semibold uppercase tracking-widest">Journey Verified</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'compliance' && (
                <div className="space-y-8 animate-fade-in">
                    {filteredAlerts.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-l-4 border-red-500 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <AlertTriangle size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                    <AlertTriangle className="text-red-500" size={20} />
                                    Critical ACTION REQUIRED
                                </h3>
                                <div className="space-y-3">
                                    {filteredAlerts.map((alert) => (
                                        <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${alert.type === 'critical' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200'}`}>
                                            {alert.type === 'critical' ? <XCircle size={18} className="mt-0.5" /> : <Clock size={18} className="mt-0.5" />}
                                            <span className="font-medium text-sm">{alert.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Certification Matrix</h3>
                                    <p className="text-xs text-gray-500">Monitor active certificates across the supply chain.</p>
                                </div>
                                <button
                                    className="text-sm text-blue-600 font-semibold hover:underline"
                                    onClick={() => { setCertFilter(null); navigate('/traceability'); }}
                                >
                                    {certFilter ? 'Clear Filter' : 'View All'}
                                </button>
                            </div>

                            {certFilter && (
                                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex items-center gap-3">
                                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                        Filtered: <strong>{certFilter.farmerName}</strong>{certFilter.certLabel ? ` — ${certFilter.certLabel}` : ''}
                                    </span>
                                    <button
                                        onClick={() => { setCertFilter(null); navigate('/traceability'); }}
                                        className="ml-auto flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
                                    >
                                        <XCircleIcon size={14} /> Clear
                                    </button>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-6 py-3">Entity</th>
                                            <th className="px-6 py-3">Type</th>
                                            <th className="px-6 py-3">ID Number</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Expiry</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {(certFilter
                                            ? allCertificates.filter(c =>
                                                c.entity.toLowerCase().includes(certFilter.farmerName.toLowerCase())
                                            )
                                            : allCertificates
                                        ).map((cert, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{cert.entity}</td>
                                                <td className="px-6 py-4">{cert.type}</td>
                                                <td className="px-6 py-4 font-mono text-gray-500">{cert.id}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${cert.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        cert.status === 'Expiring' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        }`}>
                                                        {cert.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{cert.expiry}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FileCheck size={18} className="text-blue-500" />
                                Export Permits
                            </h3>
                            <div className="space-y-4">
                                {complianceData.permits.map((permit, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">{permit.name}</h4>
                                            <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock size={12} />
                                            <span>Renews: <span className="font-mono text-gray-700 dark:text-gray-300">{permit.renewal}</span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                + Add New Permit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Traceability;
