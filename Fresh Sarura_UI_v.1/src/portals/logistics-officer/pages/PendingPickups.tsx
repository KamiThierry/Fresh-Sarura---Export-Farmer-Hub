import { useState, useEffect, useCallback } from 'react';
import { Truck, PackageCheck, Clock, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../../lib/api';
import LogPickupModal from '../components/LogPickupModal';

type Declaration = {
  _id: string;
  cropName: string;
  estimatedWeightKg: number;
  farmName: string;
  notes: string;
  status: 'Pending' | 'PickedUp';
  createdAt: string;
  declaredBy: { name: string };
  farmerId: { full_name: string; district: string };
};

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PickedUp: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const PendingPickups = () => {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'PickedUp'>('All');
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDeclarations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/harvest-declarations');
      setDeclarations(res.data);
    } catch (err) {
      console.error('Failed to fetch declarations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeclarations(); }, [fetchDeclarations]);

  const filtered = declarations.filter(d => filter === 'All' || d.status === filter);
  const pendingCount = declarations.filter(d => d.status === 'Pending').length;

  const handleLogPickup = (declaration: Declaration) => {
    setSelectedDeclaration(declaration);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Pending Pickups
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-amber-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Harvest declarations awaiting truck dispatch and pickup logging.
            </p>
          </div>
          <button
            onClick={fetchDeclarations}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Total Declarations', value: declarations.length, icon: PackageCheck, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-700/50' },
            { label: 'Pending Pickup', value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Picked Up', value: declarations.filter(d => d.status === 'PickedUp').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
                  <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                    {s.value}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${s.bg}`}>
                  <s.icon size={24} className={s.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['All', 'Pending', 'PickedUp'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {f === 'PickedUp' ? 'Picked Up' : f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Truck size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm font-medium">No harvest declarations found.</p>
              <p className="text-gray-400 text-xs mt-1">Farmers will appear here once they declare a harvest ready.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    {['Crop', 'Farm / Farmer', 'Est. Weight', 'Declared By', 'Time', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map(d => (
                    <tr key={d._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{d.cropName}</p>
                        {d.notes && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">{d.notes}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{d.farmName || d.farmerId?.full_name || '—'}</p>
                        <p className="text-xs text-gray-400">{d.farmerId?.district || ''}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                        {d.estimatedWeightKg.toLocaleString()} kg
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {d.declaredBy?.name || '—'}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(d.createdAt).toLocaleString('en-RW', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[d.status]}`}>
                          {d.status === 'PickedUp' ? 'Picked Up' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {d.status === 'Pending' ? (
                          <button
                            onClick={() => handleLogPickup(d)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            <Truck size={13} /> Log Pickup
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <LogPickupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        declaration={selectedDeclaration ? {
          id: selectedDeclaration._id,
          farm: selectedDeclaration.farmName || selectedDeclaration.farmerId?.full_name || '—',
          crop: selectedDeclaration.cropName,
          weight: selectedDeclaration.estimatedWeightKg,
        } : null}
        onSuccess={fetchDeclarations}
      />
    </>
  );
};

export default PendingPickups;
