import { useState } from 'react';
import { Upload, User } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface FarmerRegistrationFormProps {
  onFarmerAdded: () => void;
}

const FarmerRegistrationForm = ({ onFarmerAdded }: FarmerRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    cooperative_name: '',
    district: '',
    sector: '',
    produce_types: [] as string[],
    farm_size_hectares: '',
    production_capacity_tons: '',
    phone: '',
    email: '',
    location: { lat: '', lng: '' },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const districts = ['Kigali', 'Musanze', 'Rubavu', 'Nyagatare', 'Huye', 'Muhanga'];
  const sectors = ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Gicumbi', 'Kayonza'];
  const produceOptions = [
    'French Beans',
    'Chili Peppers',
    'Avocados',
    'Passion Fruits',
    'Tomatoes',
    'Mangoes',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const { error } = await supabase.from('farmers').insert([
        {
          full_name: formData.full_name,
          cooperative_name: formData.cooperative_name || null,
          district: formData.district,
          sector: formData.sector,
          produce_types: formData.produce_types,
          farm_size_hectares: parseFloat(formData.farm_size_hectares),
          production_capacity_tons: parseFloat(formData.production_capacity_tons),
          phone: formData.phone,
          email: formData.email || null,
          status: 'active',
        },
      ]);

      if (error) throw error;

      setMessage('Farmer registered successfully!');
      handleReset();
      onFarmerAdded();
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      full_name: '',
      cooperative_name: '',
      district: '',
      sector: '',
      produce_types: [],
      farm_size_hectares: '',
      production_capacity_tons: '',
      phone: '',
      email: '',
      location: { lat: '', lng: '' },
    });
  };

  const handleProduceToggle = (produce: string) => {
    setFormData((prev) => ({
      ...prev,
      produce_types: prev.produce_types.includes(produce)
        ? prev.produce_types.filter((p) => p !== produce)
        : [...prev.produce_types, produce],
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-[0_2px_6px_rgba(0,0,0,0.06)] border border-gray-200 dark:border-white/10">


      <div className="flex items-center gap-2 mb-6">
        <User className="text-[#2E7D32]" size={24} strokeWidth={2} />
        <h3 className="text-base font-semibold text-[#2E7D32]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Farmer Registration
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-[#37474F] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#F9FCFA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
            placeholder="Enter farmer's full name"
          />
        </div>

        {/* Cooperative Name */}
        <div>
          <label className="block text-sm font-medium text-[#37474F] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Cooperative Name
          </label>
          <input
            type="text"
            value={formData.cooperative_name}
            onChange={(e) => setFormData({ ...formData, cooperative_name: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#F9FCFA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
            placeholder="Enter cooperative name (optional)"
          />
        </div>

        {/* District & Sector */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#37474F] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              District *
            </label>
            <select
              required
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#F9FCFA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#37474F] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Sector *
            </label>
            <select
              required
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#F9FCFA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
            >
              <option value="">Select sector</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Produce Types */}
        <div>
          <label className="block text-sm font-medium text-[#37474F] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Produce Type *
          </label>
          <div className="flex flex-wrap gap-2">
            {produceOptions.map((produce) => (
              <button
                key={produce}
                type="button"
                onClick={() => handleProduceToggle(produce)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formData.produce_types.includes(produce)
                  ? 'bg-[#E9F7EF] text-[#2E7D32] border-2 border-[#4CAF50]'
                  : 'bg-[#F9FCFA] text-[#6B7280] border border-gray-200 hover:border-[#4CAF50]'
                  }`}
              >
                {produce}
              </button>
            ))}
          </div>
        </div>

        {/* Farm Size & Production Capacity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#37474F] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Farm Size (hectares) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.farm_size_hectares}
              onChange={(e) => setFormData({ ...formData, farm_size_hectares: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#F9FCFA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#37474F] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Capacity (tons/season) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.production_capacity_tons}
              onChange={(e) => setFormData({ ...formData, production_capacity_tons: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#F9FCFA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Farm Location (GPS) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-[#37474F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Farm Location (GPS) *
            </label>
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setFormData({
                        ...formData,
                        location: {
                          lat: position.coords.latitude.toString(),
                          lng: position.coords.longitude.toString()
                        }
                      });
                    },
                    (error) => {
                      alert("Unable to retrieve your location");
                    }
                  );
                } else {
                  alert("Geolocation is not supported by your browser");
                }
              }}
              className="text-xs text-[#2E7D32] hover:text-[#1B5E20] font-medium flex items-center gap-1"
            >
              📍 Locate Me
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="any"
              required
              value={formData.location?.lat || ''}
              onChange={(e) => setFormData({ ...formData, location: { ...formData.location, lat: e.target.value } })}
              className="w-full px-4 py-2.5 bg-[#F9FCFA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
              placeholder="Latitude"
            />
            <input
              type="number"
              step="any"
              required
              value={formData.location?.lng || ''}
              onChange={(e) => setFormData({ ...formData, location: { ...formData.location, lng: e.target.value } })}
              className="w-full px-4 py-2.5 bg-[#F9FCFA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
              placeholder="Longitude"
            />
          </div>
        </div>

        {/* Phone & Email */}
        <div>
          <label className="block text-sm font-medium text-[#37474F] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#F9FCFA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
            placeholder="+250 xxx xxx xxx"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#37474F] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#F9FCFA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
            placeholder="email@example.com (optional)"
          />
        </div>

        {/* Upload Button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F9FCFA] border border-gray-200 rounded-lg hover:bg-[#E9F7EF] hover:border-[#4CAF50] transition-all text-sm text-[#37474F]"
        >
          <Upload size={16} />
          Upload ID / Certificate
        </button>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-all font-medium text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : 'Register Farmer'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-[#37474F] rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default FarmerRegistrationForm;
