import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserAdded?: (name: string) => void;
}

const AddUserModal = ({ isOpen, onClose, onUserAdded }: AddUserModalProps) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const roles = [
        { value: 'production_manager', label: 'Production Manager' },
        { value: 'farm_manager',       label: 'Farm Manager' },
        { value: 'logistic_officer',   label: 'Logistics Officer' },
        { value: 'quality_officer',    label: 'QC Officer' },
        { value: 'admin',              label: 'Admin' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await api.post('/auth/create-user', formData);
            onUserAdded?.(formData.name);
            onClose();
            setFormData({ name: '', email: '', password: '', role: '', phone: '' });
        } catch (err: any) {
            setError(err.message || 'Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-green-50/50 dark:bg-green-900/10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <UserPlus className="text-green-600" size={20} /> Add New User
                        </h2>
                        <p className="text-sm text-gray-500">Create a new account and assign a role</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
                    <form id="add-user-form" onSubmit={handleSubmit} className="space-y-4">
                        {[
                            { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Enter full name', required: true },
                            { label: 'Email Address *', key: 'email', type: 'email', placeholder: 'name@freshsarura.rw', required: true },
                            { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+250 xxx xxx xxx', required: false },
                        ].map(({ label, key, type, placeholder, required }) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                                <input type={type} required={required} value={(formData as any)[key]}
                                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                                    placeholder={placeholder}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm dark:text-white" />
                            </div>
                        ))}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role *</label>
                            <select required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm dark:text-white">
                                <option value="">Select a role</option>
                                {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Temporary Password *</label>
                            <input type="password" required minLength={6} value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Min. 6 characters"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm dark:text-white" />
                        </div>
                    </form>
                </div>
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
                    <button type="submit" form="add-user-form" disabled={isSubmitting}
                        className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 disabled:opacity-60">
                        {isSubmitting ? 'Creating...' : <><span>Create Account</span><ArrowRight size={16} /></>}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AddUserModal;
