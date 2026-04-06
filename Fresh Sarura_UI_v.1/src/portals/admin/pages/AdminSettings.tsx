import { Settings } from 'lucide-react';

const AdminSettings = () => (
    <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                <Settings size={22} />
            </div>
            <div>
                <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">System configuration and preferences</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
                { section: 'General', fields: [{ label: 'Platform Name', value: 'Fresh Sarura' }, { label: 'Default Language', value: 'English' }, { label: 'Timezone', value: 'Africa/Kigali (UTC+2)' }] },
                { section: 'Security', fields: [{ label: 'Session Timeout', value: '30 minutes' }, { label: '2FA Requirement', value: 'Admins only' }, { label: 'Password Policy', value: 'Min 8 chars, 1 symbol' }] },
            ].map(group => (
                <div key={group.section} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">{group.section}</h2>
                    <div className="space-y-3">
                        {group.fields.map(f => (
                            <div key={f.label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                                <label className="text-sm text-gray-500 dark:text-gray-400">{f.label}</label>
                                <input
                                    defaultValue={f.value}
                                    className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400/20 focus:border-green-400 w-52 text-right transition-all"
                                />
                            </div>
                        ))}
                    </div>
                    <button className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors">
                        Save Changes
                    </button>
                </div>
            ))}
        </div>
    </div>
);

export default AdminSettings;
