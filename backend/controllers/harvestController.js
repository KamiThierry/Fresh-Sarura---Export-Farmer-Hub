import HarvestDeclaration from '../models/HarvestDeclaration.js';
import IntakeLog from '../models/IntakeLog.js';
import ProcessingBatch from '../models/ProcessingBatch.js';
import CropCycle from '../models/CropCycle.js';
import Notification from '../models/Notification.js';
import Room from '../models/Room.js';
import { notifyByRole } from './notificationController.js';
import { createEventLog } from './eventLogController.js';

// ── HARVEST DECLARATIONS ──────────────────────────────────────────────────────

// POST /api/v1/harvest-declarations  ← FM declares harvest
export const declareHarvest = async (req, res) => {
    try {
        const { cycleId, estimatedWeightKg, cropName, farmName, notes } = req.body;
        if (!cycleId || !estimatedWeightKg || !cropName) {
            return res.status(400).json({ status: 'error', message: 'cycleId, estimatedWeightKg, cropName required.' });
        }
        const cycle = await CropCycle.findById(cycleId);
        if (!cycle) return res.status(404).json({ status: 'error', message: 'Crop cycle not found.' });

        // Guard: prevent harvest declaration on cycles with no approved budget activity
        if (cycle.status === 'active' || (cycle.approved || 0) === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Harvest cannot be declared yet. This crop cycle has no approved budget requests. At least one budget request must be approved by the Production Manager before declaring a harvest, confirming that field work such as planting, irrigation, or pest control has been funded and carried out.'
            });
        }

        // Guard: prevent duplicate harvest declaration on a completed cycle
        if (cycle.status === 'completed') {
            return res.status(400).json({
                status: 'error',
                message: 'This crop cycle is already completed. No further harvest declarations can be submitted.'
            });
        }

        const declaration = await HarvestDeclaration.create({
            cycleId,
            farmerId: cycle.farmer_id,
            declaredBy: req.user._id,
            estimatedWeightKg,
            cropName,
            farmName: farmName || cycle.farm_name,
            notes,
        });

        // Notify all logistic_officer users
        await notifyByRole('logistic_officer', {
            type: 'HARVEST_DECLARED',
            title: 'New Harvest Declared',
            message: `Harvest declared: ${cropName} — est. ${estimatedWeightKg} kg. Ready for pickup.`,
            refId: declaration._id,
            refModel: 'HarvestDeclaration',
        });

        // Notify all quality_officer users
        await notifyByRole('quality_officer', {
            type: 'HARVEST_DECLARED',
            title: 'New Harvest Declared',
            message: `Harvest declared: ${cropName} — est. ${estimatedWeightKg} kg. Ready for pickup.`,
            refId: declaration._id,
            refModel: 'HarvestDeclaration',
        });

        // No cycle status change on harvest declaration — status is managed by budget approval flow

        res.status(201).json({ status: 'success', data: declaration });

        await createEventLog({
            module: 'Production & QC',
            action: 'Harvest Declared',
            severity: 'INFO',
            description: `Harvest declared: ${cropName} — est. ${estimatedWeightKg} kg from ${farmName}`,
            actor: req.user.name,
            metadata: { cycleId, cropName, estimatedWeightKg, farmName }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/harvest-declarations  ← LO sees pending pickups
export const getHarvestDeclarations = async (req, res) => {
    try {
        const filter = req.query.status ? { status: req.query.status } : {};
        const declarations = await HarvestDeclaration.find(filter)
            .populate('cycleId', 'crop_name farm_name')
            .populate('farmerId', 'full_name cooperative_name district')
            .populate('declaredBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ status: 'success', results: declarations.length, data: declarations });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/harvest-declarations/:id/pickup  ← LO logs pickup weight
export const logPickup = async (req, res) => {
    try {
        const { pickedUpWeightKg, truckId } = req.body;
        if (!pickedUpWeightKg) return res.status(400).json({ status: 'error', message: 'pickedUpWeightKg required.' });

        const declaration = await HarvestDeclaration.findById(req.params.id);
        if (!declaration) return res.status(404).json({ status: 'error', message: 'Declaration not found.' });
        if (declaration.status === 'PickedUp') return res.status(400).json({ status: 'error', message: 'Already picked up.' });

        // Create IntakeLog
        const intakeLog = await IntakeLog.create({
            harvestDeclarationId: declaration._id,
            cycleId: declaration.cycleId,
            pickedUpWeightKg,
            truckId: truckId || '',
            loggedBy: req.user._id,
        });

        // Mark declaration as picked up
        declaration.status = 'PickedUp';
        declaration.intakeLogId = intakeLog._id;
        await declaration.save();

        // Notify all quality_officer users
        await notifyByRole('quality_officer', {
            type: 'HARVEST_PICKED_UP',
            title: 'Produce Arriving',
            message: `Produce arriving: ${declaration.cropName} — ${pickedUpWeightKg} kg picked up. Intake log ready.`,
            refId: intakeLog._id,
            refModel: 'IntakeLog',
        });

        // Notify all logistic_officer users
        await notifyByRole('logistic_officer', {
            type: 'HARVEST_PICKED_UP',
            title: 'Produce Arriving',
            message: `Produce arriving: ${declaration.cropName} — ${pickedUpWeightKg} kg picked up. Intake log ready.`,
            refId: intakeLog._id,
            refModel: 'IntakeLog',
        });

        res.json({ status: 'success', message: 'Pickup logged.', data: intakeLog });

        await createEventLog({
            module: 'Production & QC',
            action: 'Produce Picked Up',
            severity: 'INFO',
            description: `Produce picked up: ${declaration.cropName} — ${pickedUpWeightKg} kg (Truck: ${truckId || 'N/A'})`,
            actor: req.user.name,
            metadata: { intakeLogId: intakeLog._id, cropName: declaration.cropName, pickedUpWeightKg, truckId }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── PROCESSING BATCHES ────────────────────────────────────────────────────────

// POST /api/v1/processing-batches  ← QC requests a room
export const requestRoom = async (req, res) => {
    try {
        const { intakeLogId, receivedWeightKg, cropName } = req.body;
        if (!intakeLogId || !receivedWeightKg) return res.status(400).json({ status: 'error', message: 'intakeLogId, receivedWeightKg required.' });

        const intakeLog = await IntakeLog.findById(intakeLogId);
        if (!intakeLog) return res.status(404).json({ status: 'error', message: 'Intake log not found.' });

        const batch = await ProcessingBatch.create({
            intakeLogId,
            cycleId: intakeLog.cycleId,
            requestedBy: req.user._id,
            receivedWeightKg,
            cropName: cropName || '',
        });

        // Notify all production_manager users
        await notifyByRole('production_manager', {
            type: 'ROOM_REQUESTED',
            title: 'Processing Room Requested',
            message: `QC requests a processing room for ${cropName || 'produce'} — ${receivedWeightKg} kg received.`,
            refId: batch._id,
            refModel: 'ProcessingBatch',
        });

        res.status(201).json({ status: 'success', data: batch });

        await createEventLog({
            module: 'Production & QC',
            action: 'Room Requested',
            severity: 'INFO',
            description: `Processing room requested for ${cropName || 'produce'} (${receivedWeightKg} kg)`,
            actor: req.user.name,
            metadata: { batchId: batch._id, receivedWeightKg, cropName }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/processing-batches/pending-room  ← PM sees room requests
export const getMyBatches = async (req, res) => {
    try {
        const batches = await ProcessingBatch.find({ requestedBy: req.user._id })
            .populate('intakeLogId', 'pickedUpWeightKg arrivedAt truckId')
            .sort({ createdAt: -1 });
        res.json({ status: 'success', results: batches.length, data: batches });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const getPendingRoomRequests = async (req, res) => {
    try {
        const batches = await ProcessingBatch.find({ status: 'RoomRequested' })
            .populate('intakeLogId', 'pickedUpWeightKg truckId arrivedAt')
            .populate('requestedBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ status: 'success', results: batches.length, data: batches });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/processing-batches/:id/assign-room  ← PM assigns room
export const assignRoom = async (req, res) => {
    try {
        const { roomId } = req.body;
        if (!roomId) return res.status(400).json({ status: 'error', message: 'roomId is required.' });

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ status: 'error', message: 'Room not found.' });
        if (room.status !== 'Available') {
            return res.status(400).json({ status: 'error', message: `Room is currently ${room.status}.` });
        }

        // Update batch
        const batch = await ProcessingBatch.findByIdAndUpdate(
            req.params.id,
            { assignedRoom: room.name, assignedRoomId: roomId, assignedBy: req.user._id, status: 'Processing' },
            { new: true }
        );
        if (!batch) return res.status(404).json({ status: 'error', message: 'Batch not found.' });

        // Flip room to In Use
        await Room.findByIdAndUpdate(roomId, { status: 'In Use' });

        // Notify QC
        await notifyByRole('quality_officer', {
            sender: req.user._id,
            type: 'ROOM_ASSIGNED',
            title: 'Processing Room Assigned',
            message: `Room "${room.name}" assigned for your processing batch. You can now begin.`,
            link: '/qc/processing',
        });

        res.json({ status: 'success', message: 'Room assigned.', data: batch });

        await createEventLog({
            module: 'Production & QC',
            action: 'Room Assigned',
            severity: 'INFO',
            description: `Room "${room.name}" assigned to processing batch`,
            actor: req.user.name,
            metadata: { batchId: batch._id, roomName: room.name, roomId }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/processing-batches/:id/complete  ← QC logs weights
export const completeBatch = async (req, res) => {
    try {
        const { processedWeightKg, rejectedWeightKg } = req.body;
        if (processedWeightKg == null || rejectedWeightKg == null) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'processedWeightKg, rejectedWeightKg required.' 
            });
        }

        const batch = await ProcessingBatch.findByIdAndUpdate(
            req.params.id,
            { processedWeightKg, rejectedWeightKg, status: 'QCDone' }, // ← was 'Done'
            { new: true }
        );
        if (!batch) return res.status(404).json({ 
            status: 'error', message: 'Batch not found.' 
        });

        // Room stays 'In Use' — PM will free it when confirming
        // Do NOT flip room back to Available here anymore

        // Notify PM to review and confirm
        await notifyByRole('production_manager', {
            type: 'QC_COMPLETED',
            title: 'QC Complete — Awaiting Your Confirmation',
            message: `${batch.cropName} processing done — ${processedWeightKg} kg approved, ${rejectedWeightKg} kg rejected. Review and confirm to add to stock.`,
            refId: batch._id,
            refModel: 'ProcessingBatch',
        });

        res.json({ status: 'success', message: 'QC complete. Awaiting PM confirmation.', data: batch });

        await createEventLog({
            module: 'Production & QC',
            action: 'QC Completed — Pending Confirmation',
            severity: 'INFO',
            description: `QC done: ${batch.cropName} — ${processedWeightKg} kg approved, ${rejectedWeightKg} kg rejected. Awaiting PM review.`,
            actor: req.user.name,
            metadata: { batchId: batch._id, processedWeightKg, rejectedWeightKg }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/processing-batches/:id/confirm  ← PM confirms QC result + optionally reassigns room
export const confirmBatch = async (req, res) => {
    try {
        const { roomId } = req.body; // optional — PM can reassign room

        const batch = await ProcessingBatch.findById(req.params.id);
        if (!batch) return res.status(404).json({ 
            status: 'error', message: 'Batch not found.' 
        });
        if (batch.status !== 'QCDone') return res.status(400).json({ 
            status: 'error', message: 'Batch is not in QCDone state.' 
        });

        const updates = { status: 'Done', confirmedBy: req.user._id };

        if (roomId) {
            // PM is reassigning to a different room
            const newRoom = await Room.findById(roomId);
            if (!newRoom) return res.status(404).json({ 
                status: 'error', message: 'Room not found.' 
            });
            if (newRoom.status !== 'Available') return res.status(400).json({ 
                status: 'error', message: `Room "${newRoom.name}" is currently ${newRoom.status}.` 
            });

            // Free the old room if different
            if (batch.assignedRoomId && batch.assignedRoomId.toString() !== roomId) {
                await Room.findByIdAndUpdate(batch.assignedRoomId, { status: 'Available' });
            }

            // Assign new room
            await Room.findByIdAndUpdate(roomId, { status: 'In Use' });
            updates.assignedRoom = newRoom.name;
            updates.assignedRoomId = roomId;
        } else {
            // Keeping existing room — just free it since processing is done
            if (batch.assignedRoomId) {
                await Room.findByIdAndUpdate(batch.assignedRoomId, { status: 'Available' });
            }
        }

        // This save triggers the pre-save hook → generates STK- id
        Object.assign(batch, updates);
        await batch.save();

        await notifyByRole('quality_officer', {
            type: 'STOCK_CONFIRMED',
            title: 'Stock Confirmed',
            message: `PM confirmed ${batch.cropName} — ${batch.processedWeightKg} kg added to stock as ${batch.stockId}.`,
            refId: batch._id,
            refModel: 'ProcessingBatch',
        });

        res.json({ status: 'success', message: 'Stock confirmed.', data: batch });

        await createEventLog({
            module: 'Production & QC',
            action: 'Stock Confirmed',
            severity: 'INFO',
            description: `PM confirmed stock: ${batch.cropName} — ${batch.processedWeightKg} kg → ${batch.stockId}`,
            actor: req.user.name,
            metadata: { 
                batchId: batch._id, 
                stockId: batch.stockId,
                processedWeightKg: batch.processedWeightKg,
                roomAssigned: batch.assignedRoom
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── STOCK ─────────────────────────────────────────────────────────────────────

// GET /api/v1/stock  ← PM + QC see final stock
export const getStock = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = { status: 'Done' };
        if (startDate && endDate) {
            filter.updatedAt = {
                $gte: new Date(startDate),
                $lte: new Date(`${endDate}T23:59:59.999Z`)
            };
        }
        const batches = await ProcessingBatch.find(filter)
            .populate('intakeLogId', 'pickedUpWeightKg arrivedAt truckId')
            .populate({
                path: 'cycleId',
                select: 'crop_name farm_name farmer_id',
                populate: { path: 'farmer_id', select: 'full_name cooperative_name' }
            })
            .sort({ updatedAt: -1 });
        res.json({ status: 'success', results: batches.length, data: batches });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/intake-logs
export const getIntakeLogs = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(`${endDate}T23:59:59.999Z`)
            };
        }
        const logs = await IntakeLog.find(filter)
            .populate('harvestDeclarationId')
            .populate('cycleId')
            .populate('loggedBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ status: 'success', results: logs.length, data: logs });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/processing-batches  ← PM/admin sees ALL batches, all statuses
export const getAllBatches = async (req, res) => {
    try {
        const batches = await ProcessingBatch.find({})
            .populate('intakeLogId', 'pickedUpWeightKg arrivedAt truckId')
            .populate('requestedBy', 'name role')
            .populate('assignedBy', 'name role')
            .populate('confirmedBy', 'name role')   // add this
            .populate('cycleId', 'crop_name farm_name cycleId')
            .sort({ updatedAt: -1 });
        res.json({ status: 'success', results: batches.length, data: batches });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/processing-batches/:id/spoil  ← PM marks stock as spoiled
export const spoilBatch = async (req, res) => {
    try {
        const batch = await ProcessingBatch.findById(req.params.id);
        if (!batch) return res.status(404).json({ status: 'error', message: 'Batch not found.' });
        if (batch.status !== 'Done') return res.status(400).json({ 
            status: 'error', message: 'Only confirmed stock can be marked as spoiled.' 
        });

        // Update status
        batch.status = 'Spoiled';
        await batch.save();

        // Free the room if still assigned
        if (batch.assignedRoomId) {
            await Room.findByIdAndUpdate(batch.assignedRoomId, { status: 'Available' });
        }

        await createEventLog({
            module: 'Production & QC',
            action: 'Stock Marked Spoiled',
            severity: 'WARNING',
            description: `Stock ${batch.stockId} marked as spoiled — ${batch.processedWeightKg} kg ${batch.cropName} written off`,
            actor: req.user.name,
            metadata: { batchId: batch._id, stockId: batch.stockId, weightKg: batch.processedWeightKg }
        });

        res.json({ status: 'success', message: 'Stock marked as spoiled.', data: batch });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};