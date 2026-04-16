import { useState } from 'react';
import {
  Search, Filter, Plus, Download,
  Users, UserCheck, Map, FileWarning, MapPin, ChevronDown, FileSpreadsheet, FileText,
  Pencil, Trash2
} from 'lucide-react';
import FarmerRegistrationModal from '../components/FarmerRegistrationModal';
import FarmNetworkMap from '../components/FarmNetworkMap';
import FarmerProfile from '../components/FarmerProfile';
import Pagination from '../../shared/component/Pagination';
import Toast from '../../shared/component/Toast';
import { Farmer } from '@/types';


import { usePMContext } from '@/context/PMContext';

const FarmerManagement = () => {
  // State
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [successToast, setSuccessToast] = useState<{ name: string } | null>(null);

  const { 
    farmers, 
    loading, 
    refreshFarmers 
  } = usePMContext();
  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading farmers...</div>;

  // Filter Logic
  const filteredFarmers = farmers.filter(farmer =>
    (statusFilter === 'all' || farmer.status.toLowerCase() === statusFilter.toLowerCase()) &&
    ((farmer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (farmer.district?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (farmer.sector?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (farmer.produce_types?.some((p: string) => p.toLowerCase().includes(searchQuery.toLowerCase())) || false))
  );

  // Stats — derived from filteredFarmers so they react to the filter & search
  const totalHa = filteredFarmers
    .reduce((sum, f) => sum + (f.farm_size_hectares || 0), 0)
    .toFixed(1);
  const stats = [
    { label: 'Total Farmers', value: String(filteredFarmers.length), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active Suppliers', value: String(filteredFarmers.filter(f => f.status === 'Active').length), icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Total Hectares', value: `${totalHa} Ha`, icon: Map, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Pending Certs', value: String(filteredFarmers.filter(f => f.status === 'Auditing').length), icon: FileWarning, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', alert: true },
  ];

  return (
    <div className="space-y-6 pb-20">

      {/* ── Header (always visible) ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Farmer Network</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage suppliers, cooperatives, and compliance data</p>
        </div>
        {!selectedFarmer && (
          <div className="flex gap-3">
            {/* Export dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExportOpen(prev => !prev)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm font-medium"
              >
                <Download size={17} />
                Export Data
                <ChevronDown size={15} className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown panel */}
              {isExportOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsExportOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Export Options</p>
                    <button
                      onClick={() => { alert('Exporting as Excel…'); setIsExportOpen(false); }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg flex-shrink-0">
                        <FileSpreadsheet size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">Export Excel</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Spreadsheet (.xlsx)</p>
                      </div>
                    </button>
                    <div className="mx-4 border-t border-gray-100 dark:border-gray-700" />
                    <button
                      onClick={() => { alert('Exporting as PDF…'); setIsExportOpen(false); }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg flex-shrink-0">
                        <FileText size={16} className="text-red-500 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">Export PDF</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Printable report (.pdf)</p>
                      </div>
                    </button>
                    <div className="pb-2" />
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setIsRegistrationOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Register Farmer
            </button>
          </div>
        )}
      </div>

      {/* ── Master view: Stats + Map + Table ── */}
      {selectedFarmer === null ? (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <div className={`text-2xl font-bold mt-1 ${stat.alert ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                      {stat.value}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={stat.color} size={24} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Geospatial Farm Map ── */}
          <FarmNetworkMap farmers={farmers} />

          {/* Main Content: Filters & Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

            {/* Filters Bar */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search farmers, locations, or crops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-4 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="auditing">Auditing</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Directory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="px-5 py-4 whitespace-nowrap">Farmer / Farm Name</th>
                    <th className="px-5 py-4 whitespace-nowrap">National ID</th>
                    <th className="px-5 py-4 whitespace-nowrap">Phone Number</th>
                    <th className="px-5 py-4 whitespace-nowrap">Email</th>
                    <th className="px-5 py-4 whitespace-nowrap">Physical Address</th>
                    <th className="px-5 py-4 whitespace-nowrap">Main Crop</th>
                    <th className="px-5 py-4 whitespace-nowrap">Land Size</th>
                    <th className="px-5 py-4 whitespace-nowrap">Status</th>
                    <th className="px-5 py-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                   {filteredFarmers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((farmer) => (
                    <tr
                      key={farmer._id}
                      className="hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors cursor-pointer"
                      onClick={() => setSelectedFarmer(farmer)}
                    >
                      {/* Farmer / Co-op */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{farmer.full_name}</span>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <MapPin size={10} />
                            {farmer.farm_name || 'Individual'}
                          </div>
                        </div>
                      </td>
                      {/* National ID */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 rounded">{farmer.national_id}</span>
                      </td>
                      {/* Phone */}
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {farmer.phone}
                      </td>
                      {/* Email */}
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                        {farmer.email}
                      </td>
                      {/* Physical Address */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">
                            {farmer.district}, {farmer.sector}
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            Cell: {farmer.cell}, Village: {farmer.village}
                          </span>
                        </div>
                      </td>
                      {/* Main Crop */}
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {farmer.produce_types?.join(', ') || 'N/A'}
                      </td>
                      {/* Land Size */}
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {farmer.farm_size_hectares} Ha
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${farmer.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                          farmer.status === 'Inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                            'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
                          }`}>
                          {farmer.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <button
                            title="Edit farmer"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          {/* Delete */}
                          <button
                            title="Delete farmer"
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination currentPage={currentPage} totalItems={filteredFarmers.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>
          </div>

          {/* Registration Modal */}
          <FarmerRegistrationModal
            isOpen={isRegistrationOpen}
            onClose={() => setIsRegistrationOpen(false)}
            onFarmerAdded={(name) => {
              refreshFarmers();
              setIsRegistrationOpen(false);
              setSuccessToast({ name });
            }}
          />

          {successToast && (
            <Toast
              message="Farmer Registered Successfully"
              subtitle={`${successToast.name} has been added to the network`}
              onClose={() => setSuccessToast(null)}
            />
          )}
        </>
      ) : (
        /* ── Detail view ── */
        <FarmerProfile
          farmer={selectedFarmer}
          onBack={() => setSelectedFarmer(null)}
        />
      )}

    </div>
  );
};

export default FarmerManagement;
