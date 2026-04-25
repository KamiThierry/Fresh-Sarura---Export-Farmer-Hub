import ExportBatch from '../models/ExportBatch.js';
import Shipment from '../models/Shipment.js';
import ExportDocument from '../models/ExportDocument.js';
import ProcessingBatch from '../models/ProcessingBatch.js';
import { notifyByRole } from './notificationController.js';

// ── EXPORT BATCHES ────────────────────────────────────────────────────────────

// POST /api/v1/export-batches  ← PM creates a packed batch from stock
export const createExportBatch = async (req, res) => {
    try {
        const {
            processingBatchId, cycleId, cropName,
            clientName, destination, gradeLabel,
            allocatedWeightKg, boxCount, weightPerBoxKg,
            targetShipmentDate,
        } = req.body;

        if (!processingBatchId || !cycleId || !cropName || !clientName || !destination || !allocatedWeightKg || !boxCount || !weightPerBoxKg) {
            return res.status(400).json({ status: 'error', message: 'processingBatchId, cycleId, cropName, clientName, destination, allocatedWeightKg, boxCount, weightPerBoxKg are required.' });
        }

        // Verify the processing batch exists and is Done
        const stock = await ProcessingBatch.findById(processingBatchId);
        if (!stock) return res.status(404).json({ status: 'error', message: 'Stock item not found.' });
        if (stock.status !== 'Done') return res.status(400).json({ status: 'error', message: 'Stock item is not yet processed (status must be Done).' });

        const batch = await ExportBatch.create({
            processingBatchId,
            cycleId,
            cropName,
            clientName,
            destination,
            gradeLabel: gradeLabel || 'Grade A',
            allocatedWeightKg: Number(allocatedWeightKg),
            boxCount: Number(boxCount),
            weightPerBoxKg: Number(weightPerBoxKg),
            targetShipmentDate: targetShipmentDate ? new Date(targetShipmentDate) : undefined,
            createdBy: req.user._id,
        });

        res.status(201).json({ status: 'success', data: batch });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/export-batches
export const getExportBatches = async (req, res) => {
    try {
        const filter = req.query.status ? { status: req.query.status } : {};
        const batches = await ExportBatch.find(filter)
            .populate('processingBatchId', 'stockId processedWeightKg assignedRoom')
            .populate('cycleId', 'crop_name farm_name')
            .sort({ createdAt: -1 });
        res.json({ status: 'success', results: batches.length, data: batches });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/export-batches/:id/ready  ← PM marks as Ready for Export
export const markReadyForExport = async (req, res) => {
    try {
        const batch = await ExportBatch.findByIdAndUpdate(
            req.params.id,
            { status: 'ReadyForExport' },
            { new: true }
        );
        if (!batch) return res.status(404).json({ status: 'error', message: 'Export batch not found.' });

        // Notify all LOs
        await notifyByRole('logistic_officer', {
            sender: req.user._id,
            type: 'EXPORT_READY',
            title: 'Export Batch Ready',
            message: `${batch.cropName} — ${batch.boxCount} boxes ready for export to ${batch.destination}.`,
            link: '/logistics/shipments',
        });

        res.json({ status: 'success', message: 'Batch marked as Ready for Export.', data: batch });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── SHIPMENTS ─────────────────────────────────────────────────────────────────

// POST /api/v1/shipments  ← LO creates shipment + generates packing list
export const createShipment = async (req, res) => {
    try {
        const {
            flightNumber, airlineCode, destination, clientName,
            departureDate, departureTime, awbNumber, invoiceNumber,
            exportBatchIds, totalBoxes, totalWeightKg, skids, notes,
        } = req.body;

        if (!flightNumber || !destination || !departureDate || !exportBatchIds?.length) {
            return res.status(400).json({ status: 'error', message: 'flightNumber, destination, departureDate, exportBatchIds required.' });
        }

        const shipment = await Shipment.create({
            flightNumber,
            airlineCode,
            destination,
            clientName,
            departureDate: new Date(departureDate),
            departureTime,
            awbNumber,
            invoiceNumber,
            exportBatches: exportBatchIds,
            totalBoxes: Number(totalBoxes) || 0,
            totalWeightKg: Number(totalWeightKg) || 0,
            skids: Number(skids) || 0,
            notes,
            status: 'PackingListGenerated',
            createdBy: req.user._id,
        });

        // Mark all assigned export batches as Shipped
        await ExportBatch.updateMany(
            { _id: { $in: exportBatchIds } },
            { status: 'Shipped' }
        );

        // Notify PM
        await notifyByRole('production_manager', {
            sender: req.user._id,
            type: 'SHIPMENT_SCHEDULED',
            title: 'Shipment Scheduled',
            message: `Packing List ${shipment.plNumber} generated for Flight ${flightNumber} to ${destination}.`,
            link: '/pm/inventory',
        });

        res.status(201).json({ status: 'success', data: shipment });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/shipments
export const getShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find()
            .populate('exportBatches', 'batchId cropName clientName boxCount allocatedWeightKg gradeLabel')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ status: 'success', results: shipments.length, data: shipments });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/shipments/:id
export const getShipmentById = async (req, res) => {
    try {
        const shipment = await Shipment.findById(req.params.id)
            .populate('exportBatches', 'batchId cropName clientName boxCount allocatedWeightKg gradeLabel destination')
            .populate('createdBy', 'name');
        if (!shipment) return res.status(404).json({ status: 'error', message: 'Shipment not found.' });

        // Also fetch documents for this shipment
        const documents = await ExportDocument.find({ shipmentId: req.params.id })
            .populate('uploadedBy', 'name');

        res.json({ status: 'success', data: { shipment, documents } });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/shipments/:id/dispatch  ← LO marks as Dispatched
export const dispatchShipment = async (req, res) => {
    try {
        const shipment = await Shipment.findByIdAndUpdate(
            req.params.id,
            { status: 'Dispatched', dispatchedAt: new Date() },
            { new: true }
        );
        if (!shipment) return res.status(404).json({ status: 'error', message: 'Shipment not found.' });

        // Notify PM
        await notifyByRole('production_manager', {
            sender: req.user._id,
            type: 'SHIPMENT_DISPATCHED',
            title: 'Shipment Dispatched',
            message: `Shipment ${shipment.plNumber} — Flight ${shipment.flightNumber} has been dispatched to ${shipment.destination}.`,
            link: '/pm/inventory',
        });

        res.json({ status: 'success', message: 'Shipment marked as dispatched.', data: shipment });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── EXPORT DOCUMENTS ──────────────────────────────────────────────────────────

// POST /api/v1/export-documents  ← LO uploads a document (base64)
export const uploadDocument = async (req, res) => {
    try {
        const { shipmentId, docType, fileName, fileUrl } = req.body;

        if (!shipmentId || !docType || !fileName || !fileUrl) {
            return res.status(400).json({ status: 'error', message: 'shipmentId, docType, fileName, fileUrl required.' });
        }

        const doc = await ExportDocument.create({
            shipmentId,
            docType,
            fileName,
            fileUrl,  // base64 string — same pattern as FieldReport.proofUrl
            uploadedBy: req.user._id,
            status: 'Uploaded',
        });

        res.status(201).json({ status: 'success', data: doc });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/export-documents
export const getDocuments = async (req, res) => {
    try {
        const filter = req.query.shipmentId ? { shipmentId: req.query.shipmentId } : {};
        const docs = await ExportDocument.find(filter)
            .populate('shipmentId', 'plNumber flightNumber')
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ status: 'success', results: docs.length, data: docs });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
