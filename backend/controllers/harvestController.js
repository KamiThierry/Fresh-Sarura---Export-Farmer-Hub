import HarvestDeclaration from '../models/HarvestDeclaration.js';
import IntakeLog from '../models/IntakeLog.js';
import ProcessingBatch from '../models/ProcessingBatch.js';
import CropCycle from '../models/CropCycle.js';
import Notification from '../models/Notification.js';

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

        const declaration = await HarvestDeclaration.create({
            cycleId,
            farmerId: cycle.farmer_id,
            declaredBy: req.user._id,
            estimatedWeightKg,
            cropName,
            farmName: farmName || cycle.farm_name,
            notes,
        });

        // Notify all logistics_officer users
        await Notification.create({
            recipientRole: 'logistics_officer',
            type: 'harvest_declared',
            message: `Harvest declared: ${cropName} — est. ${estimatedWeightKg} kg. Ready for pickup.`,
            refId: declaration._id,
            refModel: 'HarvestDeclaration',
        });

        // Update cycle status to 'harvesting'
        await CropCycle.findByIdAndUpdate(cycleId, { status: 'harvesting' });

        res.status(201).json({ status: 'success', data: declaration });
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

        // Notify all qc_officer users
        await Notification.create({
            recipientRole: 'qc_officer',
            type: 'produce_arriving',
            message: `Produce arriving: ${declaration.cropName} — ${pickedUpWeightKg} kg picked up. Intake log ready.`,
            refId: intakeLog._id,
            refModel: 'IntakeLog',
        });

        // Notify all logistics_officer users
        await Notification.create({
            recipientRole: 'logistics_officer',
            type: 'produce_arriving',
            message: `Produce arriving: ${declaration.cropName} — ${pickedUpWeightKg} kg picked up. Intake log ready.`,
            refId: intakeLog._id,
            refModel: 'IntakeLog',
        });

        res.json({ status: 'success', message: 'Pickup logged.', data: intakeLog });
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
        await Notification.create({
            recipientRole: 'production_manager',
            type: 'room_requested',
            message: `QC requests a processing room for ${cropName || 'produce'} — ${receivedWeightKg} kg received.`,
            refId: batch._id,
            refModel: 'ProcessingBatch',
        });

        res.status(201).json({ status: 'success', data: batch });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/processing-batches/pending-room  ← PM sees room requests
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
        const { assignedRoom } = req.body;
        if (!assignedRoom) return res.status(400).json({ status: 'error', message: 'assignedRoom required.' });

        const batch = await ProcessingBatch.findByIdAndUpdate(
            req.params.id,
            { assignedRoom, assignedBy: req.user._id, status: 'Processing' },
            { new: true }
        );
        if (!batch) return res.status(404).json({ status: 'error', message: 'Batch not found.' });

        // Notify all qc_officer users
        await Notification.create({
            recipientRole: 'qc_officer',
            type: 'room_assigned',
            message: `Room ${assignedRoom} assigned for your processing batch. You can now begin.`,
            refId: batch._id,
            refModel: 'ProcessingBatch',
        });

        res.json({ status: 'success', message: 'Room assigned.', data: batch });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/processing-batches/:id/complete  ← QC logs weights
export const completeBatch = async (req, res) => {
    try {
        const { processedWeightKg, rejectedWeightKg } = req.body;
        if (processedWeightKg == null || rejectedWeightKg == null) {
            return res.status(400).json({ status: 'error', message: 'processedWeightKg, rejectedWeightKg required.' });
        }
        const batch = await ProcessingBatch.findByIdAndUpdate(
            req.params.id,
            { processedWeightKg, rejectedWeightKg, status: 'Done' },
            { new: true }
        );
        if (!batch) return res.status(404).json({ status: 'error', message: 'Batch not found.' });

        // Notify all production_manager users
        await Notification.create({
            recipientRole: 'production_manager',
            type: 'batch_completed',
            message: `Processing complete: ${batch.cropName} — ${processedWeightKg} kg processed, ${rejectedWeightKg} kg rejected. Stock updated.`,
            refId: batch._id,
            refModel: 'ProcessingBatch',
        });

        res.json({ status: 'success', message: 'Batch completed.', data: batch });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── STOCK ─────────────────────────────────────────────────────────────────────

// GET /api/v1/stock  ← PM + QC see final stock
export const getStock = async (req, res) => {
    try {
        const batches = await ProcessingBatch.find({ status: 'Done' })
            .populate('cycleId', 'crop_name farm_name')
            .populate('intakeLogId', 'pickedUpWeightKg arrivedAt')
            .sort({ updatedAt: -1 });
        res.json({ status: 'success', results: batches.length, data: batches });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};