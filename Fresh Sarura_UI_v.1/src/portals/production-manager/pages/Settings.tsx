import { useState, useEffect, useRef } from 'react';
import {
    User, Mail, Globe, Shield, Bell, Zap, Plus, X, Save, Camera,
    CheckCircle, AlertCircle, LogOut, Loader2, Phone, Eye, EyeOff
} from 'lucide-react';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const navigate = useNavigate();

    // ── Profile state ──────────────────────────────────────────────────
    const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileToast, setProfileToast] = useState<{ ok: boolean; msg: string } | null>(null);

    // ── Password state ─────────────────────────────────────────────────
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [pwToast, setPwToast] = useState<{ ok: boolean; msg: string } | null>(null);

    // ── Other settings state ───────────────────────────────────────────
    const [language, setLanguage] = useState('en');
    const [notifications, setNotifications] = useState({
        budget: true, expiry: true, quality: true, daily: false
    });
    const [crops, setCrops] = useState(['Avocado (Hass)', 'Chili (Bird Eye)', 'French Beans', 'Passion Fruit']);
    const [newCrop, setNewCrop] = useState('');
    const [locations, setLocations] = useState(['Cold Room A', 'Packhouse Main', 'Dispatch Bay']);
    const [newLocation, setNewLocation] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Load real profile on mount ─────────────────────────────────────
    useEffect(() => {
        setProfileLoading(true);
        api.get('/auth/me')
            .then((res: any) => {
                const u = res.user ?? res.data?.user ?? {};
                setProfile({
                    name: u.name || '',
                    email: u.email || '',
                    phone: u.phone || '',
                });
                // Also sync localStorage
                const stored = localStorage.getItem('user');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    localStorage.setItem('user', JSON.stringify({ ...parsed, name: u.name, email: u.email }));
                }
            })
            .catch(() => {
                // Fallback to localStorage if token invalid
                const stored = localStorage.getItem('user');
                if (stored) {
                    const u = JSON.parse(stored);
                    setProfile({ name: u.name || '', email: u.email || '', phone: u.phone || '' });
                }
            })
            .finally(() => setProfileLoading(false));
    }, []);

    // Auto-dismiss toasts
    useEffect(() => {
        if (profileToast) { const t = setTimeout(() => setProfileToast(null), 4000); return () => clearTimeout(t); }
    }, [profileToast]);
    useEffect(() => {
        if (pwToast) { const t = setTimeout(() => setPwToast(null), 4000); return () => clearTimeout(t); }
    }, [pwToast]);

    // ── Handlers ───────────────────────────────────────────────────────
    const handleSaveProfile = async () => {
        setProfileSaving(true);
        try {
            await api.patch('/auth/me', { name: profile.name, email: profile.email, phone: profile.phone });
            // Update localStorage so the header refreshes on next render
            const stored = localStorage.getItem('user');
            if (stored) {
                localStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), name: profile.name, email: profile.email }));
            }
            setProfileToast({ ok: true, msg: 'Profile updated successfully.' });
        } catch (err: any) {
            setProfileToast({ ok: false, msg: err?.response?.data?.message || 'Failed to save profile.' });
        } finally {
            setProfileSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (pwForm.newPassword !== pwForm.confirm) {
            setPwToast({ ok: false, msg: 'New passwords do not match.' });
            return;
        }
        if (pwForm.newPassword.length < 6) {
            setPwToast({ ok: false, msg: 'Password must be at least 6 characters.' });
            return;
        }
        setPwSaving(true);
        try {
            await api.patch('/auth/update-password', {
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            });
            setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
            setPwToast({ ok: true, msg: 'Password changed successfully.' });
        } catch (err: any) {
            setPwToast({ ok: false, msg: err?.response?.data?.message || 'Incorrect current password.' });
        } finally {
            setPwSaving(false);
        }
    };

    const toggleNotification = (key: keyof typeof notifications) =>
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

    const addCrop = () => {
        if (newCrop && !crops.includes(newCrop)) { setCrops([...crops, newCrop]); setNewCrop(''); }
    };
    const addLocation = () => {
        if (newLocation && !locations.includes(newLocation)) { setLocations([...locations, newLocation]); setNewLocation(''); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const initials = profile.name
        ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '—';

    return (
        <div className="flex flex-col items-center pb-20 animate-fade-in">
            {/* Page Header */}
            <div className="w-full max-w-4xl mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings &amp; Preferences</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile, alerts, and system configuration.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSaveProfile}
                        disabled={profileSaving || profileLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-60"
                    >
                        {profileSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                    >
                        <LogOut size={15} /> Sign Out
                    </button>
                </div>
            </div>

            <div className="w-full max-w-4xl space-y-6">

                {/* CARD 1: MY PROFILE */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex items-center gap-2">
                        <User size={18} className="text-green-600" />
                        <h2 className="font-semibold text-gray-900 dark:text-white">My Profile</h2>
                    </div>

                    {/* Profile toast */}
                    {profileToast && (
                        <div className={`mx-6 mt-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${profileToast.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {profileToast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                            {profileToast.msg}
                        </div>
                    )}

                    <div className="p-6">
                        {profileLoading ? (
                            <div className="flex items-center gap-3 text-gray-400">
                                <Loader2 size={20} className="animate-spin text-green-600" />
                                <span className="text-sm">Loading profile...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Avatar */}
                                <div className="flex flex-col items-center gap-3">
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-md border-4 border-white dark:border-gray-800">
                                            {initials}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                            <Camera size={20} />
                                        </div>
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                                    <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>Change Photo</span>
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
                                                    value={profile.name}
                                                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
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
                                                    value={profile.email}
                                                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={profile.phone}
                                                    onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                                                    placeholder="+250 7XX XXX XXX"
                                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                                        <select
                                            value={language}
                                            onChange={e => setLanguage(e.target.value)}
                                            className="w-full pl-9 pr-8 py-2 appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-white cursor-pointer"
                                        >
                                            <option value="en">English (US)</option>
                                            <option value="fr">Français (FR)</option>
                                            <option value="rw">Kinyarwanda</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* CARD 2: CHANGE PASSWORD */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex items-center gap-2">
                        <Shield size={18} className="text-green-600" />
                        <h2 className="font-semibold text-gray-900 dark:text-white">Change Password</h2>
                    </div>

                    {pwToast && (
                        <div className={`mx-6 mt-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${pwToast.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {pwToast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                            {pwToast.msg}
                        </div>
                    )}

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Current Password', key: 'currentPassword' as const },
                                { label: 'New Password', key: 'newPassword' as const },
                                { label: 'Confirm New Password', key: 'confirm' as const },
                            ].map(({ label, key }) => (
                                <div key={key} className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                                    <div className="relative">
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            value={pwForm[key]}
                                            onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                                            placeholder="••••••••"
                                            className="w-full pl-3 pr-9 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw(v => !v)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleChangePassword}
                            disabled={pwSaving || !pwForm.currentPassword || !pwForm.newPassword}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            {pwSaving ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
                            Update Password
                        </button>
                    </div>
                </div>

                {/* CARD 3: ALERTS & NOTIFICATIONS */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex items-center gap-2">
                        <Bell size={18} className="text-green-600" />
                        <h2 className="font-semibold text-gray-900 dark:text-white">Alerts &amp; Notifications</h2>
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

                {/* CARD 4: SYSTEM CONSTANTS */}
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
                                        <button onClick={() => setCrops(crops.filter(c => c !== crop))} className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5 transition-colors">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={newCrop} onChange={e => setNewCrop(e.target.value)} placeholder="Add new crop..." onKeyDown={e => e.key === 'Enter' && addCrop()} className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none dark:bg-gray-900 dark:text-white" />
                                <button onClick={addCrop} className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Plus size={18} /></button>
                            </div>
                        </div>
                        {/* Locations */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Locations / Stores</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {locations.map(loc => (
                                    <span key={loc} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-900/50">
                                        {loc}
                                        <button onClick={() => setLocations(locations.filter(l => l !== loc))} className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="Add location..." onKeyDown={e => e.key === 'Enter' && addLocation()} className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none dark:bg-gray-900 dark:text-white" />
                                <button onClick={addLocation} className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Plus size={18} /></button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;
