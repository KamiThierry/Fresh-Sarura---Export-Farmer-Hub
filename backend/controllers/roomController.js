import Room from '../models/Room.js';

// GET /api/v1/rooms
export const getRooms = async (req, res) => {
    try {
        const filter = req.query.status ? { status: req.query.status } : {};
        const rooms = await Room.find(filter).sort({ createdAt: -1 });
        res.json({ status: 'success', results: rooms.length, data: rooms });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// POST /api/v1/rooms
export const createRoom = async (req, res) => {
    try {
        const { name, type, capacityKg } = req.body;
        if (!name || !capacityKg) {
            return res.status(400).json({ status: 'error', message: 'name and capacityKg are required.' });
        }
        const room = await Room.create({
            name,
            type: type || 'Processing',
            capacityKg: Number(capacityKg),
            createdBy: req.user._id,
        });
        res.status(201).json({ status: 'success', data: room });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/rooms/:id
export const updateRoom = async (req, res) => {
    try {
        const { name, type, capacityKg, status } = req.body;
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { ...(name && { name }), ...(type && { type }), ...(capacityKg && { capacityKg: Number(capacityKg) }), ...(status && { status }) },
            { new: true, runValidators: true }
        );
        if (!room) return res.status(404).json({ status: 'error', message: 'Room not found.' });
        res.json({ status: 'success', data: room });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
