// import { useState, useMemo } from 'react';
// import { X, Calendar, Plane, Hash, Package, Layers, Info, Save, FileText } from 'lucide-react';

// interface ShipmentBuilderDrawerProps {
//     isOpen: boolean;
//     onClose: () => void;
// }

// // Mock Stock Data
// const AVAILABLE_STOCK = [
//     { id: '1', product: 'Avocados (Hass)', grade: 'Grade A', location: 'Cold Room A', available: 1200, weightPerBox: 4, unit: 'kg' },
//     { id: '2', product: 'Avocados (Fuerte)', grade: 'Grade B', location: 'Cold Room A', available: 800, weightPerBox: 4, unit: 'kg' },
//     { id: '3', product: 'Fine Beans', grade: 'Premium', location: 'Packhouse 1', available: 500, weightPerBox: 2.5, unit: 'kg' },
//     { id: '4', product: 'Chili (Bird Eye)', grade: 'Standard', location: 'Packhouse 2', available: 300, weightPerBox: 1.5, unit: 'kg' },
//     { id: '5', product: 'Mangoes (Apple)', grade: 'Grade A', location: 'Cold Room B', available: 2000, weightPerBox: 5, unit: 'kg' },
// ];

// const ShipmentBuilderDrawer = ({ isOpen, onClose }: ShipmentBuilderDrawerProps) => {
//     // Form State
//     const [client, setClient] = useState('');
//     const [flightNo, setFlightNo] = useState('');
//     const [departureDate, setDepartureDate] = useState('');
//     const [invNumber, setInvNumber] = useState('');

//     // Stock Selection State: { [productId]: quantityBoxes }
//     const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
//     const [filter, setFilter] = useState('All');
//     const [pallets, setPallets] = useState(0);

//     // Derived Calculations
//     const totals = useMemo(() => {
//         let totalBoxes = 0;
//         let netWeight = 0;
//         let grossWeight = 0;

//         Object.entries(selectedItems).forEach(([id, boxes]) => {
//             const item = AVAILABLE_STOCK.find(s => s.id === id);
//             if (item && boxes > 0) {
//                 totalBoxes += boxes;
//                 const itemNet = boxes * item.weightPerBox;
//                 netWeight += itemNet;
//                 // Assuming 0.25kg details per box + pallet weight (approx 20kg per pallet)
//                 // Simplified: Box Gross = Net + 0.25kg
//                 grossWeight += (itemNet + (boxes * 0.25));
//             }
//         });

//         // Add pallet weight (approx 20kg per skid)
//         grossWeight += (pallets * 20);

//         return { totalBoxes, netWeight, grossWeight };
//     }, [selectedItems, pallets]);

//     const handleQuantityChange = (id: string, qty: string) => {
//         const val = parseInt(qty, 10) || 0;
//         setSelectedItems(prev => ({ ...prev, [id]: val }));
//     };

//     if (!isOpen) return null;

//     const filteredStock = filter === 'All'
//         ? AVAILABLE_STOCK
//         : AVAILABLE_STOCK.filter(item => item.product.includes(filter));

//     return (
//         <div className="fixed inset-0 z-[2000] flex justify-end">
//             {/* Backdrop */}
//             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

//             {/* Drawer Panel */}
//             <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

//                 {/* Header */}
//                 <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
//                     <div>
//                         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Packing List</h2>
//                         <p className="text-sm text-gray-500">Build a new export shipment.</p>
//                     </div>
//                     <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
//                         <X size={20} className="text-gray-500" />
//                     </button>
//                 </div>

//                 {/* Scrollable Content */}
//                 <div className="flex-1 overflow-y-auto p-6 space-y-8">

//                     {/* Section A: Trip Details */}
//                     <div className="space-y-4">
//                         <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
//                             <Plane size={14} /> Trip Details
//                         </h3>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="col-span-2">
//                                 <label className="block text-xs font-medium text-gray-500 mb-1">Client / Consignee</label>
//                                 <select
//                                     className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
//                                     value={client}
//                                     onChange={e => setClient(e.target.value)}
//                                 >
//                                     <option value="">Select Client...</option>
//                                     <option value="Tesco UK">Tesco UK</option>
//                                     <option value="Carrefour Dubai">Carrefour Dubai</option>
//                                     <option value="Albert Heijn NL">Albert Heijn NL</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-500 mb-1">Departure Date</label>
//                                 <div className="relative">
//                                     <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
//                                     <input
//                                         type="date"
//                                         className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg pl-10 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
//                                         value={departureDate}
//                                         onChange={e => setDepartureDate(e.target.value)}
//                                     />
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-500 mb-1">Flight No</label>
//                                 <div className="relative">
//                                     <Plane size={16} className="absolute left-3 top-3 text-gray-400" />
//                                     <input
//                                         type="text"
//                                         placeholder="e.g WB300"
//                                         className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg pl-10 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
//                                         value={flightNo}
//                                         onChange={e => setFlightNo(e.target.value)}
//                                     />
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-500 mb-1">PL # (Auto)</label>
//                                 <input
//                                     type="text"
//                                     value="PL-2024-001"
//                                     readOnly
//                                     className="w-full bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm text-gray-500 cursor-not-allowed"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-500 mb-1">INV #</label>
//                                 <div className="relative">
//                                     <Hash size={16} className="absolute left-3 top-3 text-gray-400" />
//                                     <input
//                                         type="text"
//                                         placeholder="Optional"
//                                         className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg pl-10 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
//                                         value={invNumber}
//                                         onChange={e => setInvNumber(e.target.value)}
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <hr className="border-gray-100 dark:border-gray-800" />

//                     {/* Section B: Stock Selection */}
//                     <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                             <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
//                                 <Package size={14} /> Add Items
//                             </h3>
//                             <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
//                                 {['All', 'Avocados', 'Chili', 'Mangoes'].map(tab => (
//                                     <button
//                                         key={tab}
//                                         onClick={() => setFilter(tab)}
//                                         className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filter === tab ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
//                                     >
//                                         {tab}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="space-y-3">
//                             {filteredStock.map(item => (
//                                 <div key={item.id} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-700 group">
//                                     <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-gray-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg shrink-0">
//                                         {item.product.charAt(0)}
//                                     </div>
//                                     <div className="flex-1">
//                                         <h4 className="font-bold text-gray-900 dark:text-white">{item.product}</h4>
//                                         <p className="text-xs text-gray-500">{item.grade} • {item.location}</p>
//                                         <p className="text-xs font-medium text-emerald-600 mt-1">Available: {item.available} {item.unit}</p>
//                                     </div>
//                                     <div className="w-24">
//                                         <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Boxes</label>
//                                         <input
//                                             type="number"
//                                             min="0"
//                                             className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-center font-bold focus:ring-2 focus:ring-indigo-500"
//                                             placeholder="0"
//                                             value={selectedItems[item.id] || ''}
//                                             onChange={(e) => handleQuantityChange(item.id, e.target.value)}
//                                         />
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Section C: Sticky Footer */}
//                 <div className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-6 shrink-0 z-10">
//                     <div className="grid grid-cols-3 gap-6 mb-6">
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Total Boxes</label>
//                             <div className="text-2xl font-bold text-gray-900 dark:text-white">{totals.totalBoxes}</div>
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Gross Weight</label>
//                             <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totals.grossWeight.toFixed(1)} <span className="text-sm text-gray-500">kg</span></div>
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Skids / Pallets</label>
//                             <div className="flex items-center gap-2">
//                                 <Layers size={20} className="text-gray-400" />
//                                 <input
//                                     type="number"
//                                     className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 text-xl font-bold py-1 focus:outline-none focus:border-indigo-500"
//                                     placeholder="0"
//                                     value={pallets || ''}
//                                     onChange={e => setPallets(parseInt(e.target.value) || 0)}
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="flex gap-3">
//                         <button className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
//                             <Save size={18} />
//                             Save Draft
//                         </button>
//                         <button
//                             className="flex-[2] px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center gap-2"
//                             onClick={() => {
//                                 onClose();
//                                 alert('Packing List Generated Successfully!');
//                             }}
//                         >
//                             <FileText size={18} />
//                             Generate Packing List
//                         </button>
//                     </div>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default ShipmentBuilderDrawer;
