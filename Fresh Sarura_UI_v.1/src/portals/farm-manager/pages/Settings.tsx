import { useState, useEffect } from 'react';
import {
    User, Smartphone, Globe, Moon, Shield, MapPin,
    Save, ChevronRight, Scale, Lock, Eye, EyeOff, Loader2
} from 'lucide-react';
import { useFarmManager } from '../../../lib/useFarmManager';
import Toast from '../../shared/component/Toast';

const Settings = () => {
    const { updateProfile, updatePassword } = useFarmManager();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [toastConfig, setToastConfig] = useState<{ message: string; subtitle?: string } | null>(null);

    // Section 1: User Profile State
    const [profile, setProfile] = useState({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || ''
    });
    const [isEditing, setIsEditing] = useState(false);

    // Section 2: App Preferences State
    const [preferences, setPreferences] = useState({
        language: currentUser.preferences?.language || 'English',
        darkMode: currentUser.preferences?.darkMode || false,
        dataSaver: currentUser.preferences?.dataSaver || false
    });

    // Section 3: Notification Settings State
    const [notifications] = useState({
        taskReminders: currentUser.preferences?.notifications?.taskReminders || true,
        weatherAlerts: currentUser.preferences?.notifications?.weatherAlerts || true,
        budgetApprovals: currentUser.preferences?.notifications?.budgetApprovals || true,
        push: currentUser.preferences?.notifications?.push || true,
        sms: currentUser.preferences?.notifications?.sms || false
    });

    // Handle Dark Mode Side Effect (Instant Feedback)
    useEffect(() => {
        const root = window.document.documentElement;
        if (preferences.darkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [preferences.darkMode]);

    // Section 4: Password Change State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateProfile({
                name: profile.name,
                phone: profile.phone,
                email: profile.email,
                preferences: {
                    ...preferences,
                    notifications
                }
            });
            setIsEditing(false);
            setToastConfig({
                message: "Profile Updated",
                subtitle: "Your changes have been saved successfully.",
            });
        } catch (err: any) {
            setToastConfig({
                message: "Update Failed",
                subtitle: err.message || "Failed to update profile",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setToastConfig({
                message: "Mismatch",
                subtitle: "New passwords do not match.",
            });
            return;
        }
        setIsSaving(true);
        try {
            await updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setToastConfig({
                message: "Password Updated",
                subtitle: "Your security settings have been updated.",
            });
        } catch (err: any) {
            console.error('Password update failure details:', err);
            setToastConfig({
                message: "Update Failed",
                subtitle: err.message || "Incorrect current password or invalid data.",
            });
        } finally {
            setIsSaving(false);
        }
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
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800 shadow-xl">
                    {profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('') : 'FM'}
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
                            {currentUser.role?.replace('_', ' ').toUpperCase() || 'FARM MANAGER'}
                        </span>
                        <button
                            onClick={handleSaveProfile}
                            disabled={!isEditing || isSaving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isEditing && !isSaving
                                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700/50 dark:text-gray-500'
                                }`}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
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
                                    onChange={(e) => {
                                        setPreferences({ ...preferences, language: e.target.value });
                                        setIsEditing(true);
                                    }}
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
                                onClick={() => {
                                    setPreferences({ ...preferences, darkMode: !preferences.darkMode });
                                    setIsEditing(true);
                                }}
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
                                onClick={() => {
                                    setPreferences({ ...preferences, dataSaver: !preferences.dataSaver });
                                    setIsEditing(true);
                                }}
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

                {/* Section 3: Password & Security (NEW) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 h-full">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-red-500" />
                        Security & Privacy
                    </h3>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        required
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                        placeholder="Min. 6 chars"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                            Update Password
                        </button>
                    </form>
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

            {toastConfig && (
                <Toast
                    message={toastConfig.message}
                    subtitle={toastConfig.subtitle}
                    onClose={() => setToastConfig(null)}
                />
            )}
        </div>
    );
};

export default Settings;
