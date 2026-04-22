import { useState, useEffect, useCallback } from 'react';
import { DoorOpen, Plus, RefreshCw, Loader2, Wrench, CheckCircle2, AlertCircle, FlaskConical, Snowflake } from 'lucide-react';
import { api } from '../../../lib/api';
import AddRoomModal from '../components/AddRoomModal';
import RoomRequestsPanel from '../components/RoomRequestsPanel';

type Room = {
    _id: string;
    name: string;
    type: 'Processing' | 'Cold Room';
    capacityKg: number;
    status: 'Available' | 'In Use' | 'Maintenance';
    createdAt: string;
};

const statusConfig = {
    'Available': { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle2 },
    'In Use':    { color: 'text-blue-600',  bg: 'bg-blue-100  dark:bg-blue-900/30',  icon: FlaskConical },
    'Maintenance': { color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Wrench },
};

const RoomManagement = () => {
    const [tab, setTab] = useState<'rooms' | 'requests'>('rooms');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchRooms = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/rooms');
            setRooms(res.data);
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    const handleStatusToggle = async (room: Room) => {
        const next = room.status === 'Available' ? 'Maintenance'
                   : room.status === 'Maintenance' ? 'Available'
                   : null; // In Use — can't manually toggle
        if (!next) return;
        setUpdatingId(room._id);
        try {
            await api.patch(`/rooms/${room._id}`, { status: next });
            await fetchRooms();
        } catch (err) {
            console.error('Failed to update room:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const available = rooms.filter(r => r.status === 'Available').length;
    const inUse     = rooms.filter(r => r.status === 'In Use').length;
    const maintenance = rooms.filter(r => r.status === 'Maintenance').length;

    return (
        <>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Room Management</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Manage packhouse rooms and assign processing spaces to QC batches.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchRooms}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <RefreshCw size={15} /> Refresh
                        </button>
                        {tab === 'rooms' && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
                            >
                                <Plus size={15} /> Add Room
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Available', value: available, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                        { label: 'In Use',    value: inUse,     color: 'text-blue-600',  bg: 'bg-blue-50  dark:bg-blue-900/20'  },
                        { label: 'Maintenance', value: maintenance, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    ].map((s, i) => (
                        <div key={i} className={`${s.bg} rounded-xl p-4`}>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl w-fit">
                    {(['rooms', 'requests'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                                tab === t
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            {t === 'rooms' ? 'All Rooms' : 'Room Requests'}
                        </button>
                    ))}
                </div>

                {/* Tab 1 — Rooms Grid */}
                {tab === 'rooms' && (
                    loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={28} className="animate-spin text-green-500" />
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <DoorOpen size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 text-sm font-medium">No rooms added yet.</p>
                            <p className="text-gray-400 text-xs mt-1">Click "Add Room" to register your first packhouse room.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rooms.map(room => {
                                const cfg = statusConfig[room.status];
                                const StatusIcon = cfg.icon;
                                return (
                                    <div key={room._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-4">
                                        {/* Room header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${room.type === 'Cold Room' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600'}`}>
                                                    {room.type === 'Cold Room' ? <Snowflake size={18} /> : <FlaskConical size={18} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{room.name}</p>
                                                    <p className="text-xs text-gray-400">{room.type}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                                                <StatusIcon size={11} />
                                                {room.status}
                                            </span>
                                        </div>

                                        {/* Capacity */}
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-2.5 flex items-center justify-between">
                                            <span className="text-xs text-gray-500 font-medium">Capacity</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{room.capacityKg.toLocaleString()} kg</span>
                                        </div>

                                        {/* Toggle button — only for Available / Maintenance */}
                                        {room.status !== 'In Use' && (
                                            <button
                                                onClick={() => handleStatusToggle(room)}
                                                disabled={updatingId === room._id}
                                                className={`w-full py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                                                    room.status === 'Available'
                                                        ? 'border-amber-300 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                                        : 'border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                }`}
                                            >
                                                {updatingId === room._id ? (
                                                    <Loader2 size={13} className="animate-spin" />
                                                ) : room.status === 'Available' ? (
                                                    <><Wrench size={13} /> Mark as Maintenance</>
                                                ) : (
                                                    <><CheckCircle2 size={13} /> Mark as Available</>
                                                )}
                                            </button>
                                        )}
                                        {room.status === 'In Use' && (
                                            <p className="text-center text-xs text-blue-500 font-medium py-1">Currently assigned to a batch</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}

                {/* Tab 2 — Room Requests */}
                {tab === 'requests' && (
                    <RoomRequestsPanel rooms={rooms} onRoomAssigned={fetchRooms} />
                )}
            </div>

            <AddRoomModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => { setIsAddModalOpen(false); fetchRooms(); }}
            />
        </>
    );
};

export default RoomManagement;
