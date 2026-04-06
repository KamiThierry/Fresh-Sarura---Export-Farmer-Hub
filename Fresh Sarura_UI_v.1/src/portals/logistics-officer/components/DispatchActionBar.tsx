import { X, ArrowRight, AlertTriangle } from 'lucide-react';

interface DispatchActionBarProps {
    selectedFarms: string[];
    selectedTruck: any | null;
    totalWeight: number;
    routeDistance: number;
    onDiscard: () => void;
    onDispatch: () => void;
    isDispatched: boolean;
}

const DispatchActionBar = ({
    selectedFarms,
    selectedTruck,
    totalWeight,
    routeDistance,
    onDiscard,
    onDispatch,
    isDispatched
}: DispatchActionBarProps) => {

    // Logic extraction
    const truckCapacity = selectedTruck?.capacity || 0;
    const isOverweight = totalWeight > truckCapacity;
    const canDispatch = selectedFarms.length > 0 && selectedTruck && !isOverweight;

    // Visibility: Only when at least one farm is selected (per user request "selectedFarms.length > 0")
    // Use slightly more permissive visibility (or truck selected) to allow discarding if just a truck is picked?
    // User said: "Visible ONLY when selectedFarms.length > 0". sticking to that.
    if (selectedFarms.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 transition-all duration-300 transform z-[1000] animate-in slide-in-from-bottom-10 fade-in">
            <div className="bg-gray-900 text-white rounded-2xl shadow-xl border border-gray-700 p-4 flex items-center justify-between">

                {/* Left: Discard */}
                <button
                    onClick={onDiscard}
                    className="text-red-400 hover:text-red-300 font-bold px-4 py-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                >
                    <X size={18} />
                    Discard Selection
                </button>

                {/* Center: Context */}
                <div className="flex flex-col items-center flex-1 px-4 border-l border-gray-700 border-r mx-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <span>Trip Est: <span className="text-white font-bold">{routeDistance}km</span></span>
                        <span className="text-gray-600">•</span>
                        <span>
                            Load: <span className={`${isOverweight ? 'text-red-400' : 'text-blue-400'} font-bold`}>
                                {totalWeight.toLocaleString()}
                            </span>
                            <span className="text-gray-500">/{truckCapacity.toLocaleString()} kg</span>
                        </span>
                    </div>
                    {isOverweight && (
                        <span className="text-xs text-red-400 flex items-center gap-1 mt-1 font-bold animate-pulse">
                            <AlertTriangle size={12} />
                            Overloaded!
                        </span>
                    )}
                </div>

                {/* Right: Dispatch */}
                <button
                    onClick={onDispatch}
                    disabled={!canDispatch || isDispatched}
                    className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2
                        ${!canDispatch
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 hover:scale-105 active:scale-95'
                        }`}
                >
                    {isDispatched ? 'Sending...' : '🚀 Dispatch & Send Link'}
                </button>
            </div>
        </div>
    );
};

export default DispatchActionBar;
