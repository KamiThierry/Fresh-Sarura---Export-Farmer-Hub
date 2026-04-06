import { useState } from 'react';
import { User, Bell, Settings as SettingsIcon, Radio, Save, Shield, Mail, Smartphone, Plane, Truck, Activity, Key, Globe, CheckCircle, AlertTriangle } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'defaults' | 'integrations'>('profile');

    return (
        <div className="space-y-6 pb-20 md:pb-0 relative animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Logistics Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your profile, notification preferences, and operational defaults.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* Left Column: Menu */}
                <div className="md:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <User size={18} /> Profile & Security
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Bell size={18} /> Notifications
                    </button>
                    <button
                        onClick={() => setActiveTab('defaults')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'defaults' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <SettingsIcon size={18} /> Operational Defaults
                    </button>
                    <button
                        onClick={() => setActiveTab('integrations')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'integrations' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Radio size={18} /> Integrations & APIs
                    </button>
                </div>

                {/* Right Column: Content */}
                <div className="md:col-span-3">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">

                        {activeTab === 'profile' && <ProfilePanel />}
                        {activeTab === 'notifications' && <NotificationsPanel />}
                        {activeTab === 'defaults' && <DefaultsPanel />}
                        {activeTab === 'integrations' && <IntegrationsPanel />}

                    </div>
                </div>

            </div>
        </div>
    );
};

// Panel A: Profile & Security
const ProfilePanel = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Personal Info */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your basic profile details.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                        <input type="text" defaultValue="Thierry" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                        <input type="text" defaultValue="M." className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input type="email" defaultValue="logistics@freshsarura.com" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                        <input type="tel" defaultValue="+250 788 123 456" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Security */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your password and 2FA settings.</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <Shield size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                            <p className="text-xs text-gray-500">Secure your account with SMS codes.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
                <div>
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-500 hover:underline">Change Password</button>
                </div>
            </div>

            {/* Action */}
            <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95">
                    <Save size={18} />
                    Save Changes
                </button>
            </div>
        </div>
    );
};

// Panel B: Notifications
const NotificationsPanel = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alert Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose how and when you want to be notified.</p>
            </div>

            <div className="space-y-4">
                {/* Headers */}
                <div className="grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="col-span-8">Event</div>
                    <div className="col-span-2 text-center">App</div>
                    <div className="col-span-2 text-center">Email/SMS</div>
                </div>

                {/* Event Rows */}
                <NotificationRow
                    title="New Harvest Ready"
                    desc="When Farm Manager submits a collection request."
                    app={true}
                    email={true}
                />
                <NotificationRow
                    title="Truck Breakdown / Maintenance"
                    desc="Critical items logged in Fleet Manager."
                    app={true}
                    email={true}
                    sms={true}
                />
                <NotificationRow
                    title="Flight Departure / Delay"
                    desc="Real-time updates on airline schedule."
                    app={true}
                    sms={true}
                />
                <NotificationRow
                    title="Driver Magic Link Status"
                    desc="When a driver opens or completes a task."
                    app={true}
                />
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700">
                <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95">
                    <Save size={18} />
                    Save Preferences
                </button>
            </div>
        </div>
    );
};

const NotificationRow = ({ title, desc, app, email, sms }: { title: string, desc: string, app?: boolean, email?: boolean, sms?: boolean }) => (
    <div className="grid grid-cols-12 items-center py-2">
        <div className="col-span-8 pr-4">
            <p className="font-bold text-gray-900 dark:text-white">{title}</p>
            <p className="text-xs text-gray-500">{desc}</p>
        </div>
        <div className="col-span-2 flex justify-center">
            {app && <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-indigo-500" />}
        </div>
        <div className="col-span-2 flex justify-center gap-2">
            {email && <Mail size={16} className="text-gray-400" />}
            {sms && <Smartphone size={16} className="text-gray-400" />}
        </div>
    </div>
);

// Panel C: Operational Defaults
const DefaultsPanel = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Defaults</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pre-filled values for builders and planners.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Origin Airport</label>
                    <div className="relative">
                        <Plane size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer">
                            <option>Kigali International (KGL)</option>
                            <option>Kamembe (KME)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Export Airline</label>
                    <div className="relative">
                        <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer">
                            <option>RwandAir (WB)</option>
                            <option>Ethiopian Airlines (ET)</option>
                            <option>Qatar Airways (QR)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Weight Unit</label>
                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700 w-fit">
                        <button className="px-4 py-1.5 bg-white dark:bg-gray-700 shadow-sm rounded-lg text-sm font-bold text-gray-900 dark:text-white">KG</button>
                        <button className="px-4 py-1.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">LBS</button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pallet Max Weight Limit (kg)</label>
                    <input type="number" defaultValue={1000} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>

            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700">
                <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95">
                    <Save size={18} />
                    Save Defaults
                </button>
            </div>
        </div>
    );
};

// Panel D: Integrations
const IntegrationsPanel = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">External Services</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage connections to third-party tools.</p>
            </div>

            <div className="space-y-4">

                {/* SMS Gateway */}
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                SMS Gateway
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full">Connected</span>
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Twilio / Africa's Talking. Powers Magic Link dispatch.</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm">
                        Manage Keys
                    </button>
                </div>

                {/* GPS Telematics */}
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                GPS Telematics
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs rounded-full">Disconnected</span>
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fleetmatics. Live tracking for Active Operations Map.</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all text-sm shadow-sm">
                        Connect Account
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Settings;
