import { useState } from 'react';
import {
    User, Mail, Globe, Shield, Bell, Zap, Plus, X, Save, Camera,
    CheckCircle, AlertCircle, LogOut
} from 'lucide-react';

const Settings = () => {
    // --- State: Profile ---
    const [language, setLanguage] = useState('en');

    // --- State: Notifications ---
    const [notifications, setNotifications] = useState({
        budget: true,
        expiry: true,
        quality: true,
        daily: false
    });

    // --- State: System Constants ---
    const [crops, setCrops] = useState(['Avocado (Hass)', 'Chili (Bird Eye)', 'French Beans', 'Passion Fruit']);
    const [newCrop, setNewCrop] = useState('');

    const [locations, setLocations] = useState(['Cold Room A', 'Packhouse Main', 'Dispatch Bay']);
    const [newLocation, setNewLocation] = useState('');

    // --- Handlers ---
    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const addCrop = () => {
        if (newCrop && !crops.includes(newCrop)) {
            setCrops([...crops, newCrop]);
            setNewCrop('');
        }
    };

    const removeCrop = (crop: string) => {
        setCrops(crops.filter(c => c !== crop));
    };

    const addLocation = () => {
        if (newLocation && !locations.includes(newLocation)) {
            setLocations([...locations, newLocation]);
            setNewLocation('');
        }
    };

    const removeLocation = (loc: string) => {
        setLocations(locations.filter(l => l !== loc));
    };

    return (
        <div className="flex flex-col items-center pb-20 animate-fade-in">
            {/* Header */}
            <div className="w-full max-w-4xl mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings & Preferences</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile, alerts, and system configuration.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors text-sm font-medium">
                    <Save size={16} />
                    Save Changes
                </button>
            </div>

            <div className="w-full max-w-4xl space-y-6">

                {/* CARD 1: ACCOUNT & SECURITY */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex items-center gap-2">
                        <User size={18} className="text-green-600" />
                        <h2 className="font-semibold text-gray-900 dark:text-white">My Profile</h2>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-md border-4 border-white dark:border-gray-800">
                                        OM
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <Camera size={20} />
                                    </div>
                                </div>
                                <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Change Photo</span>
                            </div>

                            {/* Form Fields */}
                            <div className="flex-1 w-full space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                defaultValue="Operations Manager"
                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                defaultValue="ops@freshsarura.com"
                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                    <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                                        <Shield size={16} />
                                        Change Password
                                    </button>

                                    <div className="relative">
                                        <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="w-full pl-9 pr-8 py-2 appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-white cursor-pointer"
                                        >
                                            <option value="en">English (US)</option>
                                            <option value="fr">Français (FR)</option>
                                            <option value="rw">Kinyarwanda</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD 2: ALERTS & NOTIFICATIONS */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex items-center gap-2">
                        <Bell size={18} className="text-green-600" />
                        <h2 className="font-semibold text-gray-900 dark:text-white">Alerts & Notifications</h2>
                    </div>

                    <div className="p-6 space-y-4">
                        {[
                            { id: 'budget', label: 'Budget Overruns', desc: 'Email me when a farm exceeds 90% of budget.' },
                            { id: 'expiry', label: 'Certification Expiry', desc: 'Alert me 30 days before certificates expire.' },
                            { id: 'quality', label: 'Quality Criticals', desc: "Notify me immediately for 'Rejected' batches." },
                            { id: 'daily', label: 'Daily Summary', desc: 'Send me a morning report at 7:00 AM.' },
                        ].map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>

                                <button
                                    onClick={() => toggleNotification(item.id)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${notifications[item.id as keyof typeof notifications] ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications[item.id as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CARD 3: SYSTEM CONSTANTS */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex items-center gap-2">
                        <Zap size={18} className="text-green-600" />
                        <h2 className="font-semibold text-gray-900 dark:text-white">System Constants</h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Active Crops */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Active Crops</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {crops.map(crop => (
                                    <span key={crop} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium border border-green-100 dark:border-green-900/50">
                                        {crop}
                                        <button onClick={() => removeCrop(crop)} className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5 transition-colors">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCrop}
                                    onChange={(e) => setNewCrop(e.target.value)}
                                    placeholder="Add new crop..."
                                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none dark:bg-gray-900 dark:text-white"
                                    onKeyDown={(e) => e.key === 'Enter' && addCrop()}
                                />
                                <button onClick={addCrop} className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Locations */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Locations / Stores</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {locations.map(loc => (
                                    <span key={loc} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-900/50">
                                        {loc}
                                        <button onClick={() => removeLocation(loc)} className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    placeholder="Add location..."
                                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none dark:bg-gray-900 dark:text-white"
                                    onKeyDown={(e) => e.key === 'Enter' && addLocation()}
                                />
                                <button onClick={addLocation} className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;
