import { useState } from 'react';
import { User, Bell, Save, Shield, Mail, Smartphone } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';

const Settings = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');
    const { showToast } = useToastContext();

    const handleSaveNotification = (msg: string, sub: string) => {
        showToast(msg, sub);
    };

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
                </div>

                {/* Right Column: Content */}
                <div className="md:col-span-3">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">

                        {activeTab === 'profile' && <ProfilePanel onSave={() => handleSaveNotification('Profile Updated', 'Your changes have been saved successfully.')} />}
                        {activeTab === 'notifications' && <NotificationsPanel onSave={() => handleSaveNotification('Preferences Saved', 'Notification settings updated.')} />}
                    </div>
                </div>

            </div>

        </div>
    );
};

// Panel A: Profile & Security
const ProfilePanel = ({ onSave }: { onSave: () => void }) => {
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
                        <input type="tel" defaultValue="+250 780389786" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
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
                <button 
                    onClick={onSave}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Save size={18} />
                    Save Changes
                </button>
            </div>
        </div>
    );
};

// Panel B: Notifications
const NotificationsPanel = ({ onSave }: { onSave: () => void }) => {
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
                    desc="When Farm Manager submits a pickup request."
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
                <button 
                    onClick={onSave}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
                >
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

export default Settings;
