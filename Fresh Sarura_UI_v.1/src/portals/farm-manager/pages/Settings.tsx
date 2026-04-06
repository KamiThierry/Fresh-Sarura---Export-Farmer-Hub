import { useState } from 'react';
import {
    User, Smartphone, Globe, Moon, Bell, Shield, MapPin,
    Save, ChevronRight, Scale
} from 'lucide-react';

const Settings = () => {
    // Section 1: User Profile State
    const [profile, setProfile] = useState({
        name: 'Jean-Claude Munyemana',
        phone: '+250 788 123 456'
    });
    const [isEditing, setIsEditing] = useState(false);

    // Section 2: App Preferences State
    const [preferences, setPreferences] = useState({
        language: 'English',
        darkMode: false,
        dataSaver: false
    });

    // Section 3: Notification Settings State
    const [notifications, setNotifications] = useState({
        taskReminders: true,
        weatherAlerts: true,
        budgetApprovals: true,
        push: true,
        sms: false
    });

    const handleSaveProfile = () => {
        setIsEditing(false);
        // In a real app, this would trigger an API call
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account & Preferences</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your profile details and app notification settings.</p>
            </div>

            {/* Section 1: User Profile (The Identity) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-2xl font-bold border-4 border-white dark:border-gray-800 shadow-sm">
                    FM
                </div>

                {/* Details Form */}
                <div className="flex-1 w-full space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => {
                                        setProfile({ ...profile, name: e.target.value });
                                        setIsEditing(true);
                                    }}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={profile.phone}
                                    onChange={(e) => {
                                        setProfile({ ...profile, phone: e.target.value });
                                        setIsEditing(true);
                                    }}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                            Farm Manager - Field Ops
                        </span>
                        <button
                            onClick={handleSaveProfile}
                            disabled={!isEditing}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isEditing
                                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700/50 dark:text-gray-500'
                                }`}
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section 2: App Preferences (The Experience) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 h-full">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Globe size={18} className="text-blue-500" />
                        App Preferences
                    </h3>

                    <div className="space-y-4">
                        {/* Language & Timezone */}
                        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Language</label>
                                <select
                                    value={preferences.language}
                                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                    <option>English</option>
                                    <option>Kinyarwanda</option>
                                    <option>Français</option>
                                </select>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Timezone</span>
                                <span className="font-medium text-gray-900 dark:text-white">Central Africa Time (CAT)</span>
                            </div>
                        </div>

                        {/* Appearance Toggles */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                                onClick={() => setPreferences({ ...preferences, darkMode: !preferences.darkMode })}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${preferences.darkMode ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <Moon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                                        <p className="text-xs text-gray-500">Easier on the eyes at night</p>
                                    </div>
                                </div>
                                <div className={`w-11 h-6 rounded-full relative transition-colors ${preferences.darkMode ? 'bg-purple-600' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${preferences.darkMode ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                                onClick={() => setPreferences({ ...preferences, dataSaver: !preferences.dataSaver })}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${preferences.dataSaver ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Data Saver Mode</p>
                                        <p className="text-xs text-gray-500">Reduces image quality for 3G</p>
                                    </div>
                                </div>
                                <div className={`w-11 h-6 rounded-full relative transition-colors ${preferences.dataSaver ? 'bg-green-600' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${preferences.dataSaver ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Notification Settings (The Alerts) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 h-full">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Bell size={18} className="text-orange-500" />
                        Alert Preferences
                    </h3>

                    <div className="space-y-4">
                        {/* Toggles List */}
                        <div className="space-y-3">
                            {[
                                { key: 'taskReminders', label: 'Task Reminders', desc: 'Notify me 1 day before due date' },
                                { key: 'weatherAlerts', label: 'Weather Alerts', desc: 'Storm and drought warnings' },
                                { key: 'budgetApprovals', label: 'Budget Approvals', desc: 'When HQ approves a request' }
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between">
                                    <div className="pr-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                    <div
                                        className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${notifications[item.key as keyof typeof notifications] ? 'bg-green-600' : 'bg-gray-200'}`}
                                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${notifications[item.key as keyof typeof notifications] ? 'left-6' : 'left-1'}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-4"></div>

                        {/* Channel Selection */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Notification Channels</p>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.push}
                                        onChange={() => setNotifications({ ...notifications, push: !notifications.push })}
                                        className="rounded text-green-600 focus:ring-green-500 border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Push Notification</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.sms}
                                        onChange={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                                        className="rounded text-green-600 focus:ring-green-500 border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Assigned Farm Details (Read-Only Context) */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin size={18} className="text-gray-500" />
                        Assigned Territory
                    </h3>
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">Read-Only</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Farm Name</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">Simbi Farm A</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Sector</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">Huye District</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">GPS Coordinates</p>
                        <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline mt-1 flex items-center gap-1">
                            -2.54, 29.71 <ChevronRight size={12} />
                        </a>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Size</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Scale size={14} className="text-gray-400" />
                            <p className="text-sm font-bold text-gray-900 dark:text-white">5.0 Hectares</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
