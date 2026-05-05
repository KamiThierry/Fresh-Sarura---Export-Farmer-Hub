import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Users, Search, UserPlus, Edit2, PowerOff, Filter, CheckCircle, ShieldOff, Clock, X, ChevronDown, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AddUserModal from '../components/AddUserModal';
import Toast from '../../shared/component/Toast';
import { api } from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logo from '@/assets/sarura_logo_nav.png';

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    production_manager: 'Production Manager',
    farm_manager: 'Farm Manager',
    logistic_officer: 'Logistics Officer',
    quality_officer: 'QC Officer',

};

const UserManagement = () => {
    const formatOrdinalDate = (date: Date) => {
        const d = new Date(date);
        const day = d.getDate();
        const month = d.toLocaleDateString('en-GB', { month: 'long' });
        const year = d.getFullYear();
        const s = ["th", "st", "nd", "rd"];
        const v = day % 100;
        const suffix = (v >= 11 && v <= 13) ? "th" : (s[v % 10] || s[0]);
        return `${day}${suffix} ${month} ${year}`;
    };

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('All');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [successToast, setSuccessToast] = useState<{ name: string } | null>(null);
    const [isExportOpen, setIsExportOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.newUser) {
            setSuccessToast({ name: location.state.newUser });
            // Clear the state so refreshing doesn't show the toast again
            navigate(location.pathname, { replace: true });
        }
    }, [location.state, navigate, location.pathname]);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/auth/users');
            const data = res.data?.data ?? res?.data ?? res ?? [];
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const toggleActive = async (user: any) => {
        try {
            await api.patch(`/auth/users/${user._id}`, { isActive: !user.isActive });
            fetchUsers();
        } catch (err) { console.error('Failed to update user', err); }
    };

    const saveEdit = async () => {
        if (!editingUser) return;
        try {
            await api.patch(`/auth/users/${editingUser._id}`, {
                name: editingUser.name, role: editingUser.role, phone: editingUser.phone,
            });
            setEditingUser(null);
            fetchUsers();
        } catch (err) { console.error('Failed to save edit', err); }
    };

    const handleExportXLSX = () => {
        const wb = XLSX.utils.book_new();
        const makeSheet = (headers: string[], rows: (string | number)[][]) => {
            const data = [headers, ...rows];
            const ws   = XLSX.utils.aoa_to_sheet(data);
            ws['!cols'] = headers.map((h, i) => {
                const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length));
                return { wch: Math.min(maxLen + 4, 40) };
            });
            return ws;
        };

        const userWs = makeSheet(
            ['Name', 'Email', 'Role', 'Phone', 'Status', 'Joined'],
            filtered.map(u => [
                u.name  || 'N/A',
                u.email || 'N/A',
                (ROLE_LABELS[u.role] || u.role).replace(/_/g, ' '),
                String(u.phone || 'N/A'),
                u.isActive ? 'Active' : 'Inactive',
                new Date(u.createdAt).toLocaleDateString('en-GB'),
            ])
        );

        XLSX.utils.book_append_sheet(wb, userWs, 'Users');
        XLSX.writeFile(wb, `FreshSarura_UserManagement_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        setIsExportOpen(false);
    };

    const handleExportPDF = async () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const timestamp = new Date().toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const toTitleCase = (str: string) =>
            str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        // ── 1. Header ──
        try { doc.addImage(logo, 'PNG', 15, 12, 10, 10); } catch (e) { console.warn('Logo failed'); }
        doc.setTextColor(21, 128, 61); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
        doc.text('Fresh Sarura', 28, 19);
        doc.setTextColor(107, 114, 128); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
        doc.text('Export & Farmer Hub', 28, 23);
        doc.setFontSize(10); doc.setTextColor(17, 24, 39);
        doc.text('Printed on', pageWidth - 15, 15, { align: 'right' });
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 114, 128);
        doc.text(timestamp, pageWidth - 15, 20, { align: 'right' });
        doc.setDrawColor(229, 231, 235); doc.line(15, 30, pageWidth - 15, 30);

        // ── 2. Title ──
        doc.setTextColor(17, 24, 39); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
        doc.text(`USER MANAGEMENT REPORT SUMMARY`, 15, 42);

        // ── 3. Summary Fields ──
        const summaryFields = [
            { label: 'Total Users',       value: String(filtered.length) },
            { label: 'Active Users',      value: String(filtered.filter(u => u.isActive).length) },
            { label: 'Pending/Inactive',  value: String(filtered.filter(u => !u.isActive).length) },
            { label: 'Admins',            value: String(filtered.filter(u => u.role === 'admin').length) },
        ];

        let yPos = 52;
        doc.setFontSize(9);
        summaryFields.forEach(field => {
            doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal');
            doc.text(field.label, 15, yPos);
            doc.setTextColor(17, 24, 39); doc.setFont('helvetica', 'bold');
            doc.text(field.value, pageWidth - 15, yPos, { align: 'right' });
            doc.setDrawColor(243, 244, 246); doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
            yPos += 10;
        });

        // ── 4. Table ──
        const commonHeadStyles: any = { textColor: [255, 255, 255], fontSize: 8.5, fontStyle: 'bold', fillColor: [92, 184, 92] };
        const commonBodyStyles: any = { fontSize: 8, textColor: [0, 0, 0], cellPadding: { top: 4, bottom: 4, left: 2, right: 2 } };
        const alternateRowStyles: any = { fillColor: [249, 250, 251] };

        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 24, 39);
        doc.text('SYSTEM USER ACTIVITY', 15, yPos + 10);
        
        autoTable(doc, {
            startY: yPos + 15,
            head: [['NAME', 'EMAIL', 'ROLE', 'PHONE', 'STATUS', 'JOINED']],
            body: filtered.map(u => [
                toTitleCase(u.name), u.email,
                toTitleCase(ROLE_LABELS[u.role] || u.role),
                u.phone || '—',
                u.isActive ? 'Active' : 'Inactive',
                new Date(u.createdAt).toLocaleDateString('en-GB')
            ]),
            theme: 'striped', headStyles: commonHeadStyles, bodyStyles: commonBodyStyles, alternateRowStyles,
            margin: { left: 15, right: 15, bottom: 30 },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 4) {
                    if (String(data.cell.raw) === 'Active') data.cell.styles.textColor = [22, 163, 74];
                    else data.cell.styles.textColor = [220, 38, 38];
                }
            }
        });

        // ── 5. Footer ──
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setDrawColor(229, 231, 235); doc.line(15, 275, pageWidth - 15, 275);
            doc.setFontSize(7.5); doc.setTextColor(107, 114, 128);
            doc.text('This is a computer generated report by Fresh Sarura. No signature required.', pageWidth / 2, 280, { align: 'center' });
            const footerY = 288;
            doc.text('Kigali - Rwanda | +250 788 123 456 | reports@freshsarura.rw | www.freshsarura.rw', pageWidth / 2, footerY, { align: 'center' });
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, footerY, { align: 'right' });
        }

        doc.save(`FreshSarura_UserManagement_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        setIsExportOpen(false);
    };

    const filtered = users.filter(u => {
        const matchSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ROLE_LABELS[u.role]?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'All' ||
            (statusFilter === 'Active' && u.isActive) ||
            (statusFilter === 'Inactive' && !u.isActive);
        const matchRole = roleFilter === 'All' || u.role === roleFilter;

        let matchDate = true;
        if (dateFilter !== 'All') {
            const joinedDate = new Date(u.createdAt);
            const now = new Date();
            if (dateFilter === 'Week') {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                matchDate = joinedDate >= weekAgo;
            } else if (dateFilter === 'Month') {
                const monthAgo = new Date();
                monthAgo.setMonth(now.getMonth() - 1);
                matchDate = joinedDate >= monthAgo;
            } else if (dateFilter === '3Months') {
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(now.getMonth() - 3);
                matchDate = joinedDate >= threeMonthsAgo;
            }
        }

        return matchSearch && matchStatus && matchRole && matchDate;
    });

    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const summaryStats = [
        { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Active Accounts', value: users.filter(u => u.isActive).length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Inactive', value: users.filter(u => !u.isActive).length, icon: ShieldOff, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    ];

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">User Management</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage platform users and access</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsExportOpen(!isExportOpen)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm relative">
                        <Download size={16} /> Export Data
                        <ChevronDown size={14} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                        
                        {isExportOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setIsExportOpen(false); }} />
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleExportXLSX(); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left border-b border-gray-50 dark:border-gray-700/50">
                                        <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                                            <FileSpreadsheet size={15} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Export Excel</p>
                                            <p className="text-[10px] text-gray-400">Microsoft Excel Format</p>
                                        </div>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleExportPDF(); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                                            <FileText size={15} className="text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Export PDF</p>
                                            <p className="text-[10px] text-gray-400">Print Ready Document</p>
                                        </div>
                                    </button>
                                </div>
                            </>
                        )}
                    </button>
                    <button onClick={() => setIsAddUserOpen(true)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                        <UserPlus size={16} /> Add User
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {summaryStats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}><stat.icon className={stat.color} size={22} /></div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Search users, emails, roles..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="pl-8 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer">
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                </div>
                <div className="relative">
                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                        className="pl-8 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer">
                        <option value="All">All Roles</option>
                        {Object.entries(ROLE_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                </div>
                <div className="relative">
                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
                        className="pl-8 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer">
                        <option value="All">All Time</option>
                        <option value="Week">This Week</option>
                        <option value="Month">This Month</option>
                        <option value="3Months">Last 3 Months</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Loading users...</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                                {['User', 'Role', 'Phone', 'Status', 'Joined', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {paginated.length === 0 ? (
                                <tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm">No users found.</td></tr>
                            ) : paginated.map(u => (
                                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {u.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                                                <p className="text-xs text-gray-400">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{ROLE_LABELS[u.role] || u.role}</td>
                                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{u.phone || '—'}</td>
                                    <td className="px-5 py-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-gray-400">
                                        {formatOrdinalDate(u.createdAt)}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <button onClick={() => setEditingUser({ ...u })}
                                                className="p-1.5 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Edit">
                                                <Edit2 size={15} />
                                            </button>
                                            <button onClick={() => toggleActive(u)}
                                                className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                                                title={u.isActive ? 'Deactivate' : 'Activate'}>
                                                <PowerOff size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-400">Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}</p>
                        <div className="flex gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="px-3 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setCurrentPage(p)}
                                    className={`px-3 py-1 text-xs rounded-lg border transition-colors ${p === currentPage ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{p}</button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                className="px-3 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingUser && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                    <Edit2 size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit User Profile</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Update account details and access level</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                                <input type="text" value={editingUser.name || ''}
                                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white transition-all" />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                                <input type="tel" value={editingUser.phone || ''}
                                    onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white transition-all" />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">System Role</label>
                                <div className="relative">
                                    <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                        className="w-full px-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white appearance-none transition-all">
                                        {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3">
                            <button onClick={() => setEditingUser(null)} 
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                Cancel
                            </button>
                            <button onClick={saveEdit} 
                                className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <AddUserModal
                isOpen={isAddUserOpen}
                onClose={() => setIsAddUserOpen(false)}
                onUserAdded={(name) => {
                    fetchUsers();
                    setSuccessToast({ name });
                }}
            />

            {successToast && (
                <Toast
                    message="User Created Successfully"
                    subtitle={`${successToast.name} has been added to the system.`}
                    onClose={() => setSuccessToast(null)}
                />
            )}
        </div>
    );
};

export default UserManagement;
