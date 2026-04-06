import { useState, useEffect } from 'react';
import { getForecasts, saveForecasts, YieldForecast } from '../../shared/data/mockForecasts';
import {
    Calendar, Scale, Target,
    Leaf, CheckCircle2, History, AlertCircle
} from 'lucide-react';

const YieldForecasting = () => {
    // Mock Data for Active Cycles
    const ACTIVE_CYCLES = [
        { id: 1, name: "Avocado - Season A" },
        { id: 2, name: "Chili - Plot B" },
        { id: 3, name: "Beans - Sector 4" }
    ];

    const [history, setHistory] = useState<YieldForecast[]>([]);

    useEffect(() => {
        setHistory(getForecasts());
        const handleStorage = () => setHistory(getForecasts());
        window.addEventListener('forecastsChanged', handleStorage);
        return () => window.removeEventListener('forecastsChanged', handleStorage);
    }, []);

    // Form State
    const [selectedCycle, setSelectedCycle] = useState(ACTIVE_CYCLES[0].id);
    const [harvestDate, setHarvestDate] = useState('');
    const [quantity, setQuantity] = useState('');
    const [confidence, setConfidence] = useState('Medium');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cropName = ACTIVE_CYCLES.find(c => c.id === Number(selectedCycle))?.name || 'Unknown';

        const newForecast: YieldForecast = {
            id: Date.now(),
            cycleId: Number(selectedCycle),
            submitted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            harvestDate: new Date(harvestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            crop: cropName.split(' - ')[0],
            prediction: Number(quantity),
            status: 'Pending',
            confidence,
            notes,
            accuracy: null,
            variance: null
        };

        const updated = [newForecast, ...history];
        setHistory(updated);
        saveForecasts(updated);

        // Reset Form
        setHarvestDate('');
        setQuantity('');
        setConfidence('Medium');
        setNotes('');
        alert('Forecast submitted successfully!');
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Leaf className="text-emerald-600" />
                    Yield & Harvest Forecasts
                </h1>
                <p className="text-gray-500 mt-1">Submit weekly estimates and track harvest accuracy.</p>
            </div>

            {/* Top Stats Row (The Feedback Loop) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Next Harvest */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Harvest Due</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">Oct 15</p>
                    </div>
                </div>

                {/* Card 2: Est. Volume */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
                        <Scale size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Est. Volume</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">4,500 kg</p>
                    </div>
                </div>

                {/* Card 3: Accuracy */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                        <Target size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Accuracy</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
                            <span className="text-xs text-gray-400">Last 3 forecasts</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Section: Submit Forecast (2/3 width on large screens) */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Forecast Submission</h2>
                            <p className="text-sm text-gray-500 mt-1">Provide estimates for upcoming harvests to help logistics planning.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                            <div className="space-y-6">
                                {/* Crop Cycle */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Crop Cycle
                                    </label>
                                    <select
                                        value={selectedCycle}
                                        onChange={(e) => setSelectedCycle(Number(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    >
                                        {ACTIVE_CYCLES.map(cycle => (
                                            <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Harvest Date */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Expected Harvest Date
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                required
                                                value={harvestDate}
                                                onChange={(e) => setHarvestDate(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Expected Quantity (kg)
                                        </label>
                                        <div className="relative">
                                            <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="number"
                                                required
                                                placeholder="e.g. 4500"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Confidence Level */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                        Confidence Level
                                    </label>
                                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                                        {['Low', 'Medium', 'High'].map((level) => (
                                            <button
                                                type="button"
                                                key={level}
                                                onClick={() => setConfidence(level)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${confidence === level
                                                    ? 'bg-white dark:bg-gray-600 text-emerald-600 shadow-sm'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Notes / Conditions
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="e.g. Rain expected next week, might delay harvesting by 2 days."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={24} />
                                Submit Forecast
                            </button>
                        </form>
                    </div>
                </div>

                {/* Secondary Section: History (1/3 width on large screens) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <History size={20} className="text-gray-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent History</h3>
                    </div>

                    <div className="space-y-4">
                        {history.map((record) => (
                            <div key={record.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{record.crop}</h4>
                                        <p className="text-xs text-gray-500">Submitted: {record.submitted}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${record.status === 'Verified'
                                        ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30'
                                        : 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30'
                                        }`}>
                                        {record.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                    <div>
                                        <p className="text-xs text-gray-400">Harvest Date</p>
                                        <p className="font-medium text-gray-700 dark:text-gray-200">{record.harvestDate}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Prediction</p>
                                        <p className="font-medium text-gray-700 dark:text-gray-200">{record.prediction.toLocaleString()} kg</p>
                                    </div>
                                </div>

                                {record.status === 'Verified' && (
                                    <div className={`mt-3 pt-3 border-t border-gray-100 dark:border-gray-600/50 flex items-center justify-between text-xs font-bold ${(record.accuracy || 0) >= 90 ? 'text-emerald-600' : 'text-orange-500'
                                        }`}>
                                        <span className="flex items-center gap-1.5">
                                            {(record.accuracy || 0) >= 90 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                            {record.variance}
                                        </span>
                                        <span>{record.accuracy}% Accuracy</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default YieldForecasting;
