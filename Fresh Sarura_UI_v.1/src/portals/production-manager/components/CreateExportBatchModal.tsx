import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plane, Package, Plus, Trash2, ArrowRight } from 'lucide-react';

interface CreateExportBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (batchData: any) => void;
}

const CreateExportBatchModal = ({ isOpen, onClose, onSuccess }: CreateExportBatchModalProps) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        client: '',
        destination: '',
        shipmentDate: '',
        produceType: 'Avocados (Hass)',
    });

    const [selectedStock, setSelectedStock] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Clients
    const clients = [
        { name: 'Nature Pride', dest: 'Netherlands (Rotterdam)' },
        { name: 'Carrefour UAE', dest: 'Dubai' },
        { name: 'Tesco UK', dest: 'London' },
    ];

    // Mock Available Stock
    const availableStock = [
        { id: 'STK-AVO-26', produce: 'Avocados (Hass)', grade: 'A', weight: 4200, location: 'Cold Room A' },
        { id: 'STK-AVO-27', produce: 'Avocados (Hass)', grade: 'A', weight: 1500, location: 'Cold Room B' },
        { id: 'STK-AVO-28', produce: 'Avocados (Fuerte)', grade: 'B', weight: 800, location: 'Ambient' },
    ];

    const handleAddStock = (stock: any) => {
        if (!selectedStock.find(s => s.id === stock.id)) {
            setSelectedStock([...selectedStock, { ...stock, allocateAmount: stock.weight }]);
        }
    };

    const handleRemoveStock = (id: string) => {
        setSelectedStock(selectedStock.filter(s => s.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            onSuccess({ ...formData, items: selectedStock });
            onClose();
        }, 1000);
    };

    const totalAllocated = selectedStock.reduce((sum, item) => sum + (parseFloat(item.allocateAmount) || 0), 0);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-purple-50/50 dark:bg-purple-900/10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Plane className="text-purple-600" size={20} />
                            Create Export Batch
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Allocate stock for shipment</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <form id="batch-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Client Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Client / Buyer *
                                </label>
                                <select
                                    required
                                    value={formData.client}
                                    onChange={(e) => {
                                        const client = clients.find(c => c.name === e.target.value);
                                        setFormData({
                                            ...formData,
                                            client: e.target.value,
                                            destination: client ? client.dest : ''
                                        });
                                    }}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                >
                                    <option value="">Select Client</option>
                                    {clients.map(c => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Destination *
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.destination}
                                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500"
                                    placeholder="Auto-filled"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Target Shipment Date
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.shipmentDate}
                                onChange={(e) => setFormData({ ...formData, shipmentDate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                        </div>

                        <hr className="border-gray-100 dark:border-gray-700" />

                        {/* Stock Allocator */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Package size={16} className="text-gray-500" />
                                    Allocate From Inventory
                                </label>
                                <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded font-medium">
                                    Total: {totalAllocated} kg
                                </span>
                            </div>

                            {/* Available Stock List */}
                            <div className="space-y-2 mb-4">
                                {availableStock.map(stock => {
                                    const isSelected = selectedStock.find(s => s.id === stock.id);
                                    return (
                                        <div key={stock.id} className={`p-3 rounded-lg border flex justify-between items-center transition-all ${isSelected
                                            ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
                                            : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-purple-300'
                                            }`}>
                                            <div>
                                                <div className="font-medium text-sm text-gray-900 dark:text-white">{stock.id}</div>
                                                <div className="text-xs text-gray-500">{stock.produce} • Grade {stock.grade} • {stock.location}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{stock.weight} kg</span>
                                                {!isSelected ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddStock(stock)}
                                                        className="p-1.5 rounded-md bg-gray-100 hover:bg-purple-100 text-gray-500 hover:text-purple-600 transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            className="w-20 px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                            value={selectedStock.find(s => s.id === stock.id)?.allocateAmount}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setSelectedStock(selectedStock.map(s => s.id === stock.id ? { ...s, allocateAmount: val } : s));
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveStock(stock.id)}
                                                            className="p-1.5 text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="batch-form"
                        className="flex-1 px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Batch'}
                        {!isSubmitting && <ArrowRight size={18} />}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default CreateExportBatchModal;
