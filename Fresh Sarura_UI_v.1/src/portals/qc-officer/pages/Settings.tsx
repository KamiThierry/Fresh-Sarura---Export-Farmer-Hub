import { useState } from 'react';
import { User, Bell, Shield, Globe, Moon, Save, Smartphone } from 'lucide-react';

const Settings = () => {
    const [profile, setProfile] = useState({ name: 'QC Inspector', phone: '+250 788 000 100' });
    const [isEditing, setIsEditing] = useState(false);

    const [preferences, setPreferences] = useState({
        language: 'English',
        darkMode: false,
    });

    const [notifications, setNotifications] = useState({
        newIntakeAlert: true,
        qcReminders: true,
        expiryAlerts: true,
        push: true,
        sms: false,
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage your QC Officer profile and notification preferences.</p>
            </div>

            {/* Section 1: Profile */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-theme shadow-sm p-6 flex flex-col md:flex-row items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-2xl font-bold shrink-0">
                    QC
                </div>
                <div className="flex-1 w-full space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={e => { setProfile({ ...profile, name: e.target.value }); setIsEditing(true); }}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={e => { setProfile({ ...profile, phone: e.target.value }); setIsEditing(true); }}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                            QC Officer – Packhouse Floor
                        </span>
                        <button
                            onClick={() => setIsEditing(false)}
                            disabled={!isEditing}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isEditing
                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700/50 dark:text-gray-500'
                                }`}
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section 2: App Preferences */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-theme shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Globe size={18} className="text-blue-500" /> App Preferences
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Language</label>
                                <select
                                    value={preferences.language}
                                    onChange={e => setPreferences({ ...preferences, language: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
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

                        {/* Dark Mode Toggle */}
                        <div
                            className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
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
                    </div>
                </div>

                {/* Section 3: Notifications */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-theme shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Bell size={18} className="text-orange-500" /> Alert Preferences
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-3">
                            {[
                                { key: 'newIntakeAlert', label: 'New Intake Arrival', desc: 'Alert when a truck arrives for receiving' },
                                { key: 'qcReminders', label: 'QC Inspection Due', desc: 'Remind me when batches need review' },
                                { key: 'expiryAlerts', label: 'Cold Room Expiry', desc: 'Alert when stock is within 2 days of expiry' },
                            ].map(item => (
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

                        <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Notification Channels</p>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={notifications.push} onChange={() => setNotifications({ ...notifications, push: !notifications.push })} className="rounded text-green-600 focus:ring-green-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Push</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={notifications.sms} onChange={() => setNotifications({ ...notifications, sms: !notifications.sms })} className="rounded text-green-600 focus:ring-green-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Security */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-theme shadow-sm p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield size={18} className="text-indigo-500" /> Security
                </h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl max-w-lg">
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">Two-Factor Authentication (2FA)</p>
                        <p className="text-xs text-gray-500">Secure your account with SMS codes.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
                <button className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-500 hover:underline">Change Password</button>
            </div>
        </div>
    );
};

export default Settings;
