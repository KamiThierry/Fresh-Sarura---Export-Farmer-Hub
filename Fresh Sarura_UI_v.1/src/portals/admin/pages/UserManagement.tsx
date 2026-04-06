import { useState } from 'react';
import { Users, Search, UserPlus, Edit2, Trash2, Filter, CheckCircle, Clock, ShieldOff } from 'lucide-react';
import AddUserModal from '../components/AddUserModal';
import Pagination from '../../shared/component/Pagination';

const MOCK_USERS = [
    { id: 1, name: 'Alice Kamana', email: 'alice@sarura.rw', role: 'Admin', status: 'Active', avatar: 'AK' },
    { id: 2, name: 'Peter Nioroge', email: 'peter@sarura.rw', role: 'Logistics Officer', status: 'Active', avatar: 'PN' },
    { id: 3, name: 'Grace Uwase', email: 'grace@sarura.rw', role: 'Farm Manager', status: 'Pending', avatar: 'GU' },
    { id: 4, name: 'James Habimana', email: 'james@sarura.rw', role: 'Production Manager', status: 'Active', avatar: 'JH' },
    { id: 5, name: 'Sarah Mucyo', email: 'sarah@sarura.rw', role: 'Logistics Officer', status: 'Inactive', avatar: 'SM' },
];

const STATUS_STYLES: Record<string, string> = {
    Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const filteredUsers = MOCK_USERS.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All Statuses' || user.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const summaryStats = [
        { label: 'Total Users', value: filteredUsers.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Active Accounts', value: filteredUsers.filter(u => u.status === 'Active').length.toString(), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Pending Approvals', value: filteredUsers.filter(u => u.status === 'Pending').length.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Suspended', value: filteredUsers.filter(u => u.status === 'Inactive').length.toString(), icon: ShieldOff, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    ];

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                        <Users size={22} />
                    </div>
                    <div>
                        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">User Management</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage platform users and access</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddUserOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                    <UserPlus size={16} />
                    Add User
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {summaryStats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <div className={`text-2xl font-bold mt-1 ${stat.color.replace('text-', 'text-gray-900 dark:text-white ')}`}>
                                    {stat.value}
                                </div>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Filter Row */}
            <div className="flex justify-between items-center gap-4 mb-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search users, emails..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-8 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer"
                    >
                        <option value="All Statuses">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Inactive">Suspended</option>
                    </select>
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        {currentUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-5 py-4 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {u.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                                        <p className="text-xs text-gray-400">{u.email}</p>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{u.role}</td>
                                <td className="px-5 py-4">
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[u.status]}`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 text-gray-400">
                                        <button className="p-1.5 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors group relative">
                                            <Edit2 size={16} />
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                                Edit
                                            </span>
                                        </button>
                                        <button className="p-1.5 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors group relative">
                                            <Trash2 size={16} />
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                                Delete
                                            </span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredUsers.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(p) => setCurrentPage(p)}
                />
            </div>

            {/* Modals */}
            <AddUserModal
                isOpen={isAddUserOpen}
                onClose={() => setIsAddUserOpen(false)}
            />
        </div>
    );
};

export default UserManagement;
