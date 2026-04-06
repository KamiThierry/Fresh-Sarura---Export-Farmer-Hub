import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, ShieldOff, Phone, Mail, MapPin, Leaf, Ruler, Star, BadgeCheck, Sprout, PackageCheck, Plus } from 'lucide-react';
import AddCertificateModal from './AddCertificateModal';

interface Farmer {
  id: number;
  name: string;
  location: string;
  crop: string;
  size: string;
  status: 'Active' | 'Inactive' | 'Auditing';
  grade: string;
  nationalId: string;
  phone: string;
  email: string;
  address: string;
}

interface FarmerProfileProps {
  farmer: Farmer;
  onBack: () => void;
}

const CROP_CYCLES: Record<number, { block: string; crop: string; planted: string; estYield: string; daysLeft: number }[]> = {
  1: [{ block: 'Block A', crop: 'French Beans', planted: '15 Jan 2026', estYield: '500 kg', daysLeft: 22 }],
  2: [
    { block: 'Block A', crop: 'Avocados (Hass)', planted: '01 Nov 2025', estYield: '12,000 kg', daysLeft: 60 },
    { block: 'Block B', crop: 'Avocados (Fuerte)', planted: '10 Nov 2025', estYield: '8,500 kg', daysLeft: 70 },
  ],
  3: [],
  4: [{ block: 'Plots 1-3', crop: "Chili Peppers (Bird's Eye)", planted: '20 Jan 2026', estYield: '2,800 kg', daysLeft: 35 }],
  5: [{ block: 'Main Field', crop: 'Mangoes (Kent)', planted: '10 Sep 2025', estYield: '1,200 kg', daysLeft: 14 }],
  6: [
    { block: 'Block A', crop: 'Kale', planted: '05 Feb 2026', estYield: '400 kg', daysLeft: 18 },
    { block: 'Block B', crop: 'Spinach', planted: '12 Feb 2026', estYield: '300 kg', daysLeft: 25 },
  ],
};

const HARVESTS: Record<number, { date: string; qty: string; crop: string; grade: string }[]> = {
  1: [
    { date: '28 Feb 2026', qty: '460 kg', crop: 'French Beans', grade: 'A' },
    { date: '15 Jan 2026', qty: '510 kg', crop: 'French Beans', grade: 'A' },
    { date: '02 Dec 2025', qty: '430 kg', crop: 'French Beans', grade: 'B+' },
  ],
  2: [
    { date: '20 Feb 2026', qty: '3,200 kg', crop: 'Avocados (Hass)', grade: 'A' },
    { date: '10 Jan 2026', qty: '4,100 kg', crop: 'Avocados (Hass)', grade: 'A' },
    { date: '25 Nov 2025', qty: '2,900 kg', crop: 'Avocados (Fuerte)', grade: 'A' },
  ],
  3: [
    { date: '01 Oct 2025', qty: '180 kg', crop: 'Passion Fruit', grade: 'B' },
    { date: '15 Aug 2025', qty: '200 kg', crop: 'Passion Fruit', grade: 'B+' },
    { date: '01 Jun 2025', qty: '160 kg', crop: 'Passion Fruit', grade: 'B' },
  ],
  4: [
    { date: '22 Feb 2026', qty: '950 kg', crop: 'Chili Peppers', grade: 'A' },
    { date: '10 Jan 2026', qty: '870 kg', crop: 'Chili Peppers', grade: 'A' },
    { date: '05 Dec 2025', qty: '1,020 kg', crop: 'Chili Peppers', grade: 'A' },
  ],
  5: [
    { date: '18 Feb 2026', qty: '380 kg', crop: 'Mangoes', grade: 'A' },
    { date: '30 Dec 2025', qty: '420 kg', crop: 'Mangoes', grade: 'B+' },
    { date: '10 Nov 2025', qty: '310 kg', crop: 'Mangoes', grade: 'A' },
  ],
  6: [
    { date: '25 Feb 2026', qty: '620 kg', crop: 'Mixed Veg', grade: 'A' },
    { date: '12 Jan 2026', qty: '580 kg', crop: 'Mixed Veg', grade: 'A' },
    { date: '28 Nov 2025', qty: '700 kg', crop: 'Mixed Veg', grade: 'A' },
  ],
};

const CERTS: Record<number, string[]> = {
  1: ['GlobalG.A.P.', 'Organic RW'],
  2: ['GlobalG.A.P.', 'Fair Trade', 'Rainforest Alliance'],
  3: ['Organic RW'],
  4: ['GlobalG.A.P.'],
  5: ['GlobalG.A.P.', 'Organic RW'],
  6: ['GlobalG.A.P.', 'Organic RW', 'ISO 22000'],
};

const STATUS_STYLE: Record<string, string> = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  Inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  Auditing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex-shrink-0">{icon}</div>
    <div>
      <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{value}</div>
    </div>
  </div>
);

const FarmerProfile = ({ farmer, onBack }: FarmerProfileProps) => {
  const navigate = useNavigate();
  const [isAddCertOpen, setIsAddCertOpen] = useState(false);
  const cycles = CROP_CYCLES[farmer.id] ?? [];
  const harvests = HARVESTS[farmer.id] ?? [];
  const certs = CERTS[farmer.id] ?? [];

  const handleCertClick = (certLabel: string) => {
    const params = new URLSearchParams({
      farmerId: String(farmer.id),
      farmerName: farmer.name,
      docType: 'Certification',
      certLabel,
    });
    navigate(`/traceability?${params.toString()}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
      >
        <ArrowLeft size={16} />
        Back to Farmer Directory
      </button>

      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-black text-green-600 dark:text-green-400">
              {farmer.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{farmer.name}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[farmer.status]}`}>
                {farmer.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin size={12} /> {farmer.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Pencil size={15} /> Edit Profile
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <ShieldOff size={15} /> Suspend Account
          </button>
        </div>
      </div>

      {/* 3-column info grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Identity & Contact */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Identity &amp; Contact</h3>
          <InfoRow icon={<BadgeCheck size={15} className="text-blue-500" />} label="National ID"
            value={<span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{farmer.nationalId}</span>} />
          <InfoRow icon={<Phone size={15} className="text-green-500" />} label="Phone" value={farmer.phone} />
          <InfoRow icon={<Mail size={15} className="text-purple-500" />} label="Email" value={<span className="text-blue-600 dark:text-blue-400">{farmer.email}</span>} />
        </div>

        {/* Farm Specifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Farm Specifications</h3>
          <InfoRow icon={<MapPin size={15} className="text-orange-500" />} label="Physical Address"
            value={<span className="text-xs leading-relaxed">{farmer.address}</span>} />
          <InfoRow icon={<Leaf size={15} className="text-green-500" />} label="Main Crop" value={farmer.crop} />
          <InfoRow icon={<Ruler size={15} className="text-gray-500" />} label="Land Size" value={farmer.size} />
        </div>

        {/* Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Performance</h3>
          <InfoRow
            icon={<Star size={15} className="text-yellow-400 fill-yellow-400" />}
            label="Overall Rating"
            value={<span className="font-bold">{farmer.grade !== '-' ? `⭐ ${farmer.grade}` : '—'}</span>}
          />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-2">Active Certifications</p>
            {certs.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {certs.map(c => (
                  <button
                    key={c}
                    onClick={() => handleCertClick(c)}
                    title={`View ${c} records in Compliance Matrix`}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 hover:shadow-sm transition-all cursor-pointer"
                  >
                    {c} ↗
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No certifications on file</p>
            )}
          </div>

          {/* Add New Certificate */}
          <button
            className="w-full mt-1 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 text-xs font-semibold hover:border-green-400 hover:text-green-600 dark:hover:border-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all flex items-center justify-center gap-1.5"
            onClick={() => setIsAddCertOpen(true)}
          >
            <Plus size={13} />
            Add New Certificate
          </button>
        </div>
      </div>

      {/* Operational data — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Active Crop Cycles */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <Sprout size={15} className="text-green-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Active Crop Cycles</h3>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
              {cycles.length} active
            </span>
          </div>
          {cycles.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/40 text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-2.5 text-left">Block</th>
                  <th className="px-5 py-2.5 text-left">Crop</th>
                  <th className="px-5 py-2.5 text-left">Planted</th>
                  <th className="px-5 py-2.5 text-left">Est. Yield</th>
                  <th className="px-5 py-2.5 text-left">Days Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {cycles.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-700 dark:text-gray-300">{c.block}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{c.crop}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{c.planted}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800 dark:text-gray-200">{c.estYield}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.daysLeft <= 20 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'}`}>
                        {c.daysLeft}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-5 py-8 text-sm text-gray-400 text-center italic">No active crop cycles</p>
          )}
        </div>

        {/* Recent Harvests */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <PackageCheck size={15} className="text-blue-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Harvests</h3>
            <span className="ml-auto text-xs text-gray-400">Last 3 deliveries</span>
          </div>
          {harvests.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/40 text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-2.5 text-left">Date</th>
                  <th className="px-5 py-2.5 text-left">Crop</th>
                  <th className="px-5 py-2.5 text-left">Quantity</th>
                  <th className="px-5 py-2.5 text-left">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {harvests.slice(0, 3).map((h, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{h.date}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{h.crop}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800 dark:text-gray-200">{h.qty}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${h.grade === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'}`}>
                        {h.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-5 py-8 text-sm text-gray-400 text-center italic">No harvest records found</p>
          )}
        </div>
      </div>

      {/* Add Certificate Modal */}
      <AddCertificateModal
        isOpen={isAddCertOpen}
        onClose={() => setIsAddCertOpen(false)}
        defaultFarmer={farmer.name}
        onSubmit={(data) => {
          console.log('New certificate recorded:', data);
          setIsAddCertOpen(false);
        }}
      />

    </div>
  );
};

export default FarmerProfile;
