import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Filter, Plus, Download,
  Users, UserCheck, Map, MapPin, ChevronDown, FileSpreadsheet, FileText,
  Pencil, Trash2, Trophy
} from 'lucide-react';
import FarmerRegistrationModal from '../components/FarmerRegistrationModal';
import FarmNetworkMap from '../components/FarmNetworkMap';
import FarmerProfile from '../components/FarmerProfile';
import Pagination from '../../shared/component/Pagination';
import Toast from '../../shared/component/Toast';
import { Farmer } from '@/types';


import { usePMContext } from '@/context/PMContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/sarura_logo_nav.png';
import * as XLSX from 'xlsx';
import { api } from '@/lib/api';

const FarmerManagement = () => {
  // State
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [successToast, setSuccessToast] = useState<{ name: string } | null>(null);

  const { 
    farmers, 
    cycles,
    loading, 
    refreshFarmers 
  } = usePMContext();

  // Extract unique crops for filter
  const uniqueCrops = useMemo(() => {
    const crops = new Set<string>();
    farmers.forEach(f => f.produce_types?.forEach((p: string) => crops.add(p)));
    return Array.from(crops).sort();
  }, [farmers]);

  // Harvest declarations for leaderboard & profile metrics
  const [harvestDeclarations, setHarvestDeclarations] = useState<any[]>([]);
  useEffect(() => {
    api.get('/harvest-declarations')
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setHarvestDeclarations(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error('Failed to fetch harvest declarations:', err));
  }, []);

  // Deep-link: open a specific farmer profile when ?profileId= is in the URL (from Traceability)
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const profileId = searchParams.get('profileId');
    if (profileId && farmers.length > 0) {
      const match = farmers.find((f) => String(f._id) === profileId);
      if (match) setSelectedFarmer(match);
    }
  }, [searchParams, farmers]);

  // Filter Logic (must be before early return — used in stats below)
  const filteredFarmers = farmers.filter(farmer =>
    (statusFilter === 'all' || farmer.status.toLowerCase() === statusFilter.toLowerCase()) &&
    (cropFilter === 'all' || farmer.produce_types?.some((p: string) => p.toLowerCase() === cropFilter.toLowerCase())) &&
    ((farmer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (farmer.district?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (farmer.sector?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (farmer.produce_types?.some((p: string) => p.toLowerCase().includes(searchQuery.toLowerCase())) || false))
  );

  // Top suppliers leaderboard — sourced from HarvestDeclaration.estimatedWeightKg
  const topSuppliers = useMemo(() => {
    return farmers
      .map((f) => ({
        farmer: f,
        totalKg: harvestDeclarations
          .filter((d: any) => {
            const fid = d.farmerId?._id ?? d.farmerId;
            return String(fid) === String(f._id);
          })
          .reduce((s: number, d: any) => s + (d.estimatedWeightKg || 0), 0),
      }))
      .sort((a, b) => b.totalKg - a.totalKg)
      .slice(0, 5);
  }, [farmers, harvestDeclarations]);
  const maxKg = topSuppliers[0]?.totalKg || 1;

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading farmers...</div>;

  // Stats — derived from filteredFarmers so they react to the filter & search
  const totalHa = filteredFarmers
    .reduce((sum, f) => sum + (f.farm_size_hectares || 0), 0)
    .toFixed(1);
  const stats = [
    { label: 'Total Farmers', value: String(filteredFarmers.length), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active Suppliers', value: String(filteredFarmers.filter(f => f.status === 'Active').length), icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Total Hectares', value: `${totalHa} Ha`, icon: Map, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  // ─── Export Logic ────────────────────────────────────────────────
  const handleExportXLSX = () => {
    const wb = XLSX.utils.book_new();

    // Helper: create a styled worksheet
    const makeSheet = (headers: string[], rows: (string | number)[][]) => {
      const data = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws['!cols'] = headers.map((h, i) => {
        const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length));
        return { wch: Math.min(maxLen + 4, 40) };
      });
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };
      return ws;
    };

    // Sheet 1: Farmers
    const farmerWs = makeSheet(
      ['Full Name', 'Farm Name', 'National ID', 'Phone', 'Email', 'District', 'Sector', 'Cell', 'Village', 'Produce Types', 'Farm Size (ha)', 'Capacity (Tons)', 'Status', 'Registered'],
      filteredFarmers.map(f => [
        f.full_name,
        f.farm_name || 'Individual',
        f.national_id || 'N/A',
        String(f.phone || 'N/A'),
        f.email || 'N/A',
        f.district || 'N/A',
        f.sector || 'N/A',
        f.cell || 'N/A',
        f.village || 'N/A',
        (f.produce_types || []).join(', '),
        f.farm_size_hectares || 0,
        f.production_capacity_tons || 0,
        f.status || 'Active',
        new Date(f.created_at || '').toLocaleDateString('en-GB'),
      ])
    );
    XLSX.utils.book_append_sheet(wb, farmerWs, 'Farmers');

    // Sheet 2: Crop Cycles (related to these farmers)
    const cycleWs = makeSheet(
      ['Cycle ID', 'Crop Name', 'Season', 'Status', 'Start Date'],
      cycles.map(c => [
        String(c._id).slice(-8).toUpperCase(),
        c.crop_name || 'N/A',
        c.season || 'N/A',
        c.status || 'N/A',
        new Date(c.start_date || '').toLocaleDateString('en-GB'),
      ])
    );
    XLSX.utils.book_append_sheet(wb, cycleWs, 'Crop Cycles');

    XLSX.writeFile(wb, `FreshSarura_Farmer_Network_${new Date().toISOString().split('T')[0]}.xlsx`);
    setIsExportOpen(false);
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const timestamp = new Date().toLocaleString('en-GB', { 
        day: '2-digit', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
    const toTitleCase = (str: string) => str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

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
    doc.text('FARMER NETWORK AUDIT REPORT', 15, 42);

    // ── 3. Summary Section ──
    const summaryFields = [
      { label: 'Total Registered Farmers', value: String(filteredFarmers.length) },
      { label: 'Active Suppliers',        value: String(farmers.filter(f => f.status.toLowerCase() === 'active').length) },
      { label: 'Total Managed Land',      value: `${totalHa} Ha` },
      { label: 'Top Supplier Volume',     value: topSuppliers[0]?.totalKg >= 1000 ? `${(topSuppliers[0].totalKg / 1000).toFixed(2)} T` : `${topSuppliers[0]?.totalKg || 0} kg` },
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

    // ── 4. Data Tables ──
    const commonHeadStyles: any = { textColor: [255, 255, 255], fontSize: 8.5, fontStyle: 'bold', fillColor: [92, 184, 92] };
    const commonBodyStyles: any = { fontSize: 8, textColor: [0, 0, 0], cellPadding: { top: 4, bottom: 4, left: 2, right: 2 } };
    const alternateRowStyles: any = { fillColor: [249, 250, 251] };

    // Top Suppliers Table
    const top4 = topSuppliers.slice(0, 4);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 24, 39);
    doc.text('TOP SUPPLIERS BY VOLUME', 15, yPos + 10);
    
    autoTable(doc, {
      startY: yPos + 15,
      head: [['RANK', 'FARMER', 'FARM NAME', 'TOTAL VOLUME']],
      body: top4.map((s, i) => [
        `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}`,
        toTitleCase(s.farmer.full_name),
        toTitleCase(s.farmer.farm_name || 'Individual'),
        s.totalKg >= 1000 ? `${(s.totalKg / 1000).toFixed(2)} T` : `${s.totalKg} kg`
      ]),
      theme: 'striped', headStyles: commonHeadStyles, bodyStyles: commonBodyStyles, alternateRowStyles,
      margin: { left: 15, right: 15 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Registered Farmers Table
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text('REGISTERED FARMERS DIRECTORY', 15, yPos);
    autoTable(doc, {
      startY: yPos + 5,
      head: [['FARMER / FARM', 'CONTACT INFO', 'PHYSICAL ADDRESS', 'MAIN CROP', 'SIZE', 'STATUS']],
      body: filteredFarmers.map(f => [
        `${toTitleCase(f.full_name)}\n${toTitleCase(f.farm_name || 'Individual')}`,
        `${f.phone || 'N/A'}\n${f.email || 'N/A'}`,
        `${toTitleCase(f.district)}, ${toTitleCase(f.sector)}`,
        (f.produce_types || []).join(', '),
        `${f.farm_size_hectares || 0} ha`,
        toTitleCase(f.status || 'Active')
      ]),
      theme: 'striped', headStyles: commonHeadStyles, bodyStyles: commonBodyStyles, alternateRowStyles,
      margin: { left: 15, right: 15, bottom: 30 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const s = String(data.cell.raw).toLowerCase();
          if (s.includes('active'))   data.cell.styles.textColor = [22, 163, 74];
          if (s.includes('inactive')) data.cell.styles.textColor = [220, 38, 38];
        }
      }
    });

    // ── 5. System Insights ──
    let lastY = (doc as any).lastAutoTable?.finalY || yPos;
    if (lastY > 210) { doc.addPage(); lastY = 20; }
    
    doc.setTextColor(17, 24, 39); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text('SYSTEM INSIGHTS', 15, lastY + 15);
    
    const activePercent = ((farmers.filter(f => f.status.toLowerCase() === 'active').length / (farmers.length || 1)) * 100).toFixed(1);
    doc.setFontSize(8.5); doc.setTextColor(75, 85, 99); doc.setFont('helvetica', 'normal');
    doc.text(`• Network Health: ${activePercent}% of the registered farmer network is currently active.`, 15, lastY + 23);
    doc.text(`• Land Utilization: The system monitors a total of ${totalHa} hectares of productive farmland.`, 15, lastY + 29);
    doc.text(`• Supplier Performance: The leading supplier has contributed ${(topSuppliers[0]?.totalKg / 1000).toFixed(2)} Tons to the hub.`, 15, lastY + 35);

    // ── 6. Footer ──
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

    doc.save(`FreshSarura_Farmers_${new Date().toISOString().split('T')[0]}.pdf`);
    setIsExportOpen(false);
  };

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
                      onClick={handleExportXLSX}
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
                      onClick={handleExportPDF}
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
          <div className="grid grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
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

          {/* ── Top Suppliers Leaderboard ── */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-amber-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Top Suppliers by Volume</h3>
              <span className="ml-auto text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total Intake Received</span>
            </div>
            {topSuppliers.length === 0 || maxKg === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-4">No supply intake data yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {topSuppliers.map(({ farmer, totalKg }, i) => {
                  const barWidth = maxKg > 0 ? Math.round((totalKg / maxKg) * 100) : 0;
                  const label = totalKg >= 1000 ? `${(totalKg / 1000).toFixed(2)} T` : `${totalKg.toLocaleString()} kg`;
                  const medals = ['🥇', '🥈', '🥉', '4th', '5th'];
                  const colors = [
                    'from-yellow-400 to-amber-500',
                    'from-slate-300 to-slate-400',
                    'from-orange-300 to-orange-400',
                    'from-green-400 to-emerald-500',
                    'from-teal-400 to-cyan-500',
                  ];
                  return (
                    <button
                      key={farmer._id}
                      onClick={() => setSelectedFarmer(farmer)}
                      className="flex flex-col gap-2 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{medals[i]}</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex-1 truncate group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                          {farmer.full_name}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${colors[i]} transition-all duration-700`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

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
                  className="pl-4 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="auditing">Auditing</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>

              {/* Crop Filter */}
              <div className="relative">
                <select
                  value={cropFilter}
                  onChange={(e) => setCropFilter(e.target.value)}
                  className="pl-4 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer text-sm"
                >
                  <option value="all">All Crops</option>
                  {uniqueCrops.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
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
                    <th className="px-5 py-4 whitespace-nowrap">Date Joined</th>
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
                      {/* Date Joined */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {farmer.created_at ? new Date(farmer.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
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
          allFarmers={farmers}
          allStock={harvestDeclarations}
        />
      )}

    </div>
  );
};

export default FarmerManagement;
