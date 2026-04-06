import { useState } from 'react';
import { Search, Filter, User, MapPin, Leaf } from 'lucide-react';
import { Farmer } from '../types';

interface FarmerDirectoryProps {
  farmers: Farmer[];
  isLoading: boolean;
  onViewProfile: (farmer: Farmer) => void;
}

const FarmerDirectory = ({ farmers, isLoading, onViewProfile }: FarmerDirectoryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredFarmers = farmers.filter((farmer) => {
    const matchesSearch =
      farmer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.produce_types.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (farmer.cooperative_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || farmer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-[0_2px_6px_rgba(0,0,0,0.06)] border-theme">


      <h3 className="text-base font-semibold text-[#2E7D32] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Farmer Directory
      </h3>

      {/* Search and Filter Bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, or crop type"
            className="w-full pl-10 pr-4 py-2.5 bg-[#F9FCFA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="pl-10 pr-4 py-2.5 bg-[#F9FCFA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" size={18} />
        </div>
      </div>

      {/* Farmer Cards Grid (Scrollable List) */}
      <div className="space-y-3 h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="text-center py-12 text-[#6B7280]">Loading farmers...</div>
        ) : filteredFarmers.length === 0 ? (
          <div className="text-center py-12 text-[#6B7280]">
            {searchQuery || statusFilter !== 'all' ? 'No farmers found matching your criteria' : 'No farmers registered yet'}
          </div>
        ) : (
          filteredFarmers.map((farmer) => (
            <div
              key={farmer.id}
              className="flex items-center gap-4 p-3 bg-[#F9FCFA] rounded-lg hover:bg-[#E9F7EF] transition-all border border-gray-100 hover:border-[#4CAF50] cursor-pointer"
              onClick={() => onViewProfile(farmer)}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center flex-shrink-0">
                {farmer.photo_url ? (
                  <img src={farmer.photo_url} alt={farmer.full_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="text-white" size={16} strokeWidth={2} />
                )}
              </div>

              {/* Farmer Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-semibold text-[#222222] truncate">{farmer.full_name}</h4>
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${farmer.status === 'active' ? 'bg-[#4CAF50]' : 'bg-gray-400'
                      }`}
                  ></span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                  <div className="flex items-center gap-1">
                    <MapPin size={10} />
                    <span className="truncate max-w-[80px]">{farmer.district}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Leaf size={10} />
                    <span className="truncate">{farmer.produce_types[0]}</span>
                    {farmer.produce_types.length > 1 && <span>+{farmer.produce_types.length - 1}</span>}
                  </div>
                </div>
              </div>

              {/* View Button */}
              <button className="text-xs font-medium text-green-600 hover:text-green-700 px-2 py-1 bg-green-50 hover:bg-green-100 rounded">
                View
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {!isLoading && filteredFarmers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-[#6B7280]">
          Showing {filteredFarmers.length} of {farmers.length} farmers
        </div>
      )}
    </div>
  );
};

export default FarmerDirectory;
