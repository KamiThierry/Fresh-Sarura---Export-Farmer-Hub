import Room from '../models/Room.js';
import ProcessingBatch from '../models/ProcessingBatch.js';
import ExportBatch from '../models/ExportBatch.js';

// Internal utility to sync all room loads with actual batches
export const syncAllRoomLoads = async () => {
    const rooms = await Room.find({});
    
    // Aggregation to get total allocation per processing batch
    const allocations = await ExportBatch.aggregate([
        { $group: { _id: '$processingBatchId', totalAllocated: { $sum: '$allocatedWeightKg' } } }
    ]);
    const allocationMap = allocations.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.totalAllocated;
        return acc;
    }, {});

    for (const room of rooms) {
        const activeBatches = await ProcessingBatch.find({
            assignedRoomId: room._id,
            status: { $in: ['Processing', 'QCDone', 'Done'] }
        });

        const totalLoad = activeBatches.reduce((sum, b) => {
            const actualWeight = b.processedWeightKg ?? b.receivedWeightKg ?? 0;
            const allocated = allocationMap[b._id.toString()] || 0;
            return sum + Math.max(0, actualWeight - allocated);
        }, 0);

        // Update room status based on load
        let status = room.status;
        if (status !== 'Maintenance') {
            status = totalLoad > 0 ? 'In Use' : 'Available';
        }

        await Room.findByIdAndUpdate(room._id, {
            currentLoadKg: totalLoad,
            status
        });
    }
};

// GET /api/v1/rooms
export const getRooms = async (req, res) => {
    try {
        // Sync before returning to ensure real-time accuracy
        await syncAllRoomLoads();
        
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
            currentLoadKg: 0,
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

        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ status: 'error', message: 'Room not found.' });

        // Prevent flipping to Maintenance if batches are currently using it
        if (status === 'Maintenance') {
            const activeBatches = await ProcessingBatch.countDocuments({
                assignedRoomId: room._id,
                status: { $in: ['Processing', 'RoomRequested'] }
            });
            if (activeBatches > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: `Cannot set to Maintenance — ${activeBatches} active batch(es) still assigned to this room.`
                });
            }
        }

        // Prevent shrinking capacity below current load
        if (capacityKg && Number(capacityKg) < room.currentLoadKg) {
            return res.status(400).json({
                status: 'error',
                message: `New capacity (${capacityKg} kg) cannot be less than current load (${room.currentLoadKg} kg).`
            });
        }

        const updated = await Room.findByIdAndUpdate(
            req.params.id,
            {
                ...(name && { name }),
                ...(type && { type }),
                ...(capacityKg && { capacityKg: Number(capacityKg) }),
                ...(status && { status }),
            },
            { new: true, runValidators: true }
        );

        res.json({ status: 'success', data: updated });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/rooms/:id/expand  — increase capacity
export const expandCapacity = async (req, res) => {
    try {
        const { additionalKg } = req.body;
        if (!additionalKg || Number(additionalKg) <= 0) {
            return res.status(400).json({ status: 'error', message: 'additionalKg must be a positive number.' });
        }

        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ status: 'error', message: 'Room not found.' });

        const newCapacity = room.capacityKg + Number(additionalKg);
        const updated = await Room.findByIdAndUpdate(
            req.params.id,
            { capacityKg: newCapacity },
            { new: true }
        );

        res.json({
            status: 'success',
            message: `Room capacity expanded from ${room.capacityKg} kg to ${newCapacity} kg.`,
            data: updated
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/rooms/:id/clear  — PM manually clears room load
export const clearRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ status: 'error', message: 'Room not found.' });

        const updated = await Room.findByIdAndUpdate(
            req.params.id,
            { currentLoadKg: 0, status: 'Available' },
            { new: true }
        );

        res.json({
            status: 'success',
            message: `Room "${room.name}" cleared and marked as Available.`,
            data: updated
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/rooms/:id/batches  — fetch batches in a room
export const getRoomBatches = async (req, res) => {
    try {
        const batches = await ProcessingBatch.find({
            assignedRoomId: req.params.id,
            status: { $in: ['Processing', 'QCDone', 'Done'] }
        }).populate('requestedBy', 'name')
          .sort({ updatedAt: -1 })
          .lean();
        
        const batchIds = batches.map(b => b._id);
        const allocations = await ExportBatch.aggregate([
            { $match: { processingBatchId: { $in: batchIds } } },
            { $group: { _id: '$processingBatchId', totalAllocated: { $sum: '$allocatedWeightKg' } } }
        ]);
        const allocationMap = allocations.reduce((acc, curr) => {
            acc[curr._id.toString()] = curr.totalAllocated;
            return acc;
        }, {});

        const enriched = batches.map(b => {
            const actual = b.processedWeightKg ?? b.receivedWeightKg ?? 0;
            const allocated = allocationMap[b._id.toString()] || 0;
            return {
                ...b,
                availableWeightKg: Math.max(0, actual - allocated),
                totalAllocatedKg: allocated
            };
        });
          
        res.json({ status: 'success', results: enriched.length, data: enriched });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
