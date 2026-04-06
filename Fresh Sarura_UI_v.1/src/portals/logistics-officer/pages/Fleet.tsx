import { useState } from 'react';
import { Users, Truck, Wrench, Search, Filter, Plus, Calendar, Phone, MoreVertical, Eye } from 'lucide-react';
import AddVehicleModal from '../components/AddVehicleModal';
import LogMaintenanceModal from '../components/LogMaintenanceModal';
import AddDriverModal from '../components/AddDriverModal';
import AssignTruckModal from '../components/AssignTruckModal';
import Pagination from '../../shared/component/Pagination';

// Mock Data - Matches Dispatch Board Context
const MOCK_VEHICLES = [
    { id: 'V001', plate: 'RAC 123 A', type: 'Refrigerated Truck', capacity: '5,000 kg', driver: 'John Mugisha', nextService: 'Nov 15, 2026', status: 'Available' },
    { id: 'V002', plate: 'RAC 456 B', type: 'Standard Truck', capacity: '3,000 kg', driver: 'Peter Nioroge', nextService: 'Oct 20, 2026', status: 'On Trip' },
    { id: 'V003', plate: 'RAC 789 C', type: 'Refrigerated Truck', capacity: '7,000 kg', driver: 'Sarah Uwase', nextService: 'Dec 05, 2026', status: 'Available' },
    { id: 'V004', plate: 'RAC 990 D', type: 'Van', capacity: '1,500 kg', driver: 'Unassigned', nextService: 'Sep 30, 2026', status: 'Maintenance' },
    { id: 'V005', plate: 'RAC 555 E', type: 'Refrigerated Truck', capacity: '10,000 kg', driver: 'David Kwizera', nextService: 'Jan 12, 2027', status: 'Available' },
];

const MOCK_DRIVERS = [
    { id: 'D001', name: 'John Mugisha', contact: '+250 788 123 456', license: 'Cat B, C • Exp: Dec 2026', vehicle: 'RAC 123 A', status: 'Idle' },
    { id: 'D002', name: 'Peter Nioroge', contact: '+250 788 234 567', license: 'Cat C, E • Exp: Nov 2025', vehicle: 'RAC 456 B', status: 'Driving' },
    { id: 'D003', name: 'Sarah Uwase', contact: '+250 788 345 678', license: 'Cat B, C • Exp: Oct 2026', vehicle: 'RAC 789 C', status: 'Idle' },
    { id: 'D004', name: 'David Kwizera', contact: '+250 788 456 789', license: 'Cat C • Exp: Jan 2024 (Expiring)', vehicle: 'RAC 555 E', status: 'Idle' },
    { id: 'D005', name: 'Eric Manzi', contact: '+250 788 567 890', license: 'Cat B • Exp: Mar 2027', vehicle: 'Unassigned', status: 'Off Duty' },
];

const Fleet = () => {
    const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers'>('vehicles');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [vehiclePage, setVehiclePage] = useState(1);
    const [driverPage, setDriverPage] = useState(1);
    const itemsPerPage = 3;

    // Modal State
    const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
    const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
    const [selectedVehicleForMaintenance, setSelectedVehicleForMaintenance] = useState<string>('');

    const handleOpenMaintenance = (plate: string) => {
        setSelectedVehicleForMaintenance(plate);
        setIsMaintenanceOpen(true);
    };

    const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
    const [isAssignTruckOpen, setIsAssignTruckOpen] = useState(false);
    const [selectedDriverForAssignment, setSelectedDriverForAssignment] = useState<any>(null);

    const handleOpenAssignTruck = (driver: any) => {
        setSelectedDriverForAssignment(driver);
        setIsAssignTruckOpen(true);
    };

    // Filter Data
    const filteredVehicles = MOCK_VEHICLES.filter(v => {
        const matchesSearch = v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || v.type.toLowerCase().includes(searchTerm.toLowerCase());
        const isVehicleTab = activeTab === 'vehicles';
        const matchesStatus = !isVehicleTab || filterStatus === 'All' || v.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const filteredDrivers = MOCK_DRIVERS.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
        const isDriverTab = activeTab === 'drivers';
        const matchesStatus = !isDriverTab || filterStatus === 'All' || d.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Available Vehicles for Assignment (Excluding Maintenance/On Trip)
    const availableVehiclesForAssignment = MOCK_VEHICLES.filter(v => v.status === 'Available');

    // Stats Calculations
    const vehicleStats = {
        total: filteredVehicles.length,
        active: filteredVehicles.filter(v => v.status === 'Available' || v.status === 'On Trip').length,
        maintenance: filteredVehicles.filter(v => v.status === 'Maintenance').length
    };

    const driverStats = {
        total: filteredDrivers.length,
        onShift: filteredDrivers.filter(d => d.status === 'Driving' || d.status === 'Idle').length,
        offDuty: filteredDrivers.filter(d => d.status === 'Off Duty').length
    };

    const maintenanceAlerts = filteredVehicles.filter(v => {
        // Simple mock logic for "Due" based on string check or status
        return v.status === 'Maintenance' || v.nextService.includes('2024'); // Mock expiring
    }).length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Idle': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'On Trip': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Driving': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Maintenance': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'Off Duty': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0 relative animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fleet & Drivers</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage vehicle assets, driver profiles, and assignments.</p>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Vehicles</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{vehicleStats.total}</h3>
                        <p className="text-xs text-emerald-600 mt-1 font-medium">{vehicleStats.active} Active • {vehicleStats.maintenance} Maintenance</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Truck size={24} />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Drivers</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{driverStats.total}</h3>
                        <p className="text-xs text-blue-600 mt-1 font-medium">{driverStats.onShift} On Shift</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Users size={24} />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Maintenance Alerts</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{maintenanceAlerts} Due</h3>
                        <p className="text-xs text-amber-600 mt-1 font-medium">Check immediately</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Wrench size={24} />
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="space-y-4">
                {/* Tabs & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => { setActiveTab('vehicles'); setFilterStatus('All'); setVehiclePage(1); }}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'vehicles' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <Truck size={16} /> Vehicles
                        </button>
                        <button
                            onClick={() => { setActiveTab('drivers'); setFilterStatus('All'); setDriverPage(1); }}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'drivers' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <Users size={16} /> Drivers
                        </button>
                    </div>

                    <div className="flex items-center gap-3">

                        {/* Filter Dropdown */}
                        <div className="relative">
                            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="pl-10 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer font-medium text-gray-700 dark:text-gray-200"
                            >
                                <option value="All">All Statuses</option>
                                {activeTab === 'vehicles' ? (
                                    <>
                                        <option value="Available">Available</option>
                                        <option value="On Trip">On Trip</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Idle">Idle</option>
                                        <option value="Driving">Driving</option>
                                        <option value="Off Duty">Off Duty</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (activeTab === 'vehicles') setIsAddVehicleOpen(true);
                                if (activeTab === 'drivers') setIsAddDriverOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={18} />
                            Add {activeTab === 'vehicles' ? 'Vehicle' : 'Driver'}
                        </button>
                    </div>
                </div>

                {/* Content Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase tracking-wider text-xs">
                                <tr>
                                    {activeTab === 'vehicles' ? (
                                        <>
                                            <th className="px-6 py-4 font-semibold">Plate Number</th>
                                            <th className="px-6 py-4 font-semibold">Type & Capacity</th>
                                            <th className="px-6 py-4 font-semibold">Current Driver</th>
                                            <th className="px-6 py-4 font-semibold">Next Service</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4 font-semibold">Name</th>
                                            <th className="px-6 py-4 font-semibold">Contact</th>
                                            <th className="px-6 py-4 font-semibold">License Details</th>
                                            <th className="px-6 py-4 font-semibold">Current Vehicle</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {activeTab === 'vehicles' ? (
                                    filteredVehicles.slice((vehiclePage - 1) * itemsPerPage, vehiclePage * itemsPerPage).map(vehicle => (
                                        <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{vehicle.plate}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-900 dark:text-white font-medium">{vehicle.type}</div>
                                                <div className="text-xs text-gray-500">{vehicle.capacity}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                {vehicle.driver === 'Unassigned' ? (
                                                    <span className="text-gray-400 italic">Unassigned</span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                                            {vehicle.driver.substring(0, 1)}
                                                        </div>
                                                        {vehicle.driver}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {vehicle.nextService}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${getStatusColor(vehicle.status)}`}>
                                                    {vehicle.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenMaintenance(vehicle.plate)}
                                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Log Service"
                                                    >
                                                        <Wrench size={16} />
                                                    </button>
                                                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Edit">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    filteredDrivers.slice((driverPage - 1) * itemsPerPage, driverPage * itemsPerPage).map(driver => (
                                        <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 dark:text-white">{driver.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-1.5 font-mono text-xs">
                                                    <Phone size={14} className="text-gray-400" />
                                                    {driver.contact}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`text-sm ${driver.license.includes('Expiring') ? 'text-amber-600 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
                                                    {driver.license}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {driver.vehicle === 'Unassigned' ? (
                                                    <span className="text-gray-400 italic text-xs">Unassigned</span>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded w-fit text-xs">
                                                        <Truck size={12} className="text-indigo-500" />
                                                        {driver.vehicle}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${getStatusColor(driver.status)}`}>
                                                    {driver.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="View Profile">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenAssignTruck(driver)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Assign Truck"
                                                    >
                                                        <Truck size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {activeTab === 'vehicles'
                        ? <Pagination currentPage={vehiclePage} totalItems={filteredVehicles.length} itemsPerPage={itemsPerPage} onPageChange={setVehiclePage} />
                        : <Pagination currentPage={driverPage} totalItems={filteredDrivers.length} itemsPerPage={itemsPerPage} onPageChange={setDriverPage} />
                    }
                </div>
            </div>

            {/* Modals */}
            <AddVehicleModal
                isOpen={isAddVehicleOpen}
                onClose={() => setIsAddVehicleOpen(false)}
            />

            <LogMaintenanceModal
                isOpen={isMaintenanceOpen}
                onClose={() => setIsMaintenanceOpen(false)}
                vehiclePlate={selectedVehicleForMaintenance}
            />

            <AddDriverModal
                isOpen={isAddDriverOpen}
                onClose={() => setIsAddDriverOpen(false)}
            />

            {selectedDriverForAssignment && (
                <AssignTruckModal
                    isOpen={isAssignTruckOpen}
                    onClose={() => { setIsAssignTruckOpen(false); setSelectedDriverForAssignment(null); }}
                    driverName={selectedDriverForAssignment.name}
                    licenseStatus={selectedDriverForAssignment.license.includes('Expiring') ? 'Expiring Soon' : 'Valid'}
                    availableVehicles={availableVehiclesForAssignment}
                />
            )}

        </div>
    );
};

export default Fleet;
