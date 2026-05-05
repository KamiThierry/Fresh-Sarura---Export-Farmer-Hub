import ExportBatch from '../models/ExportBatch.js';
import ProcessingBatch from '../models/ProcessingBatch.js';
import IntakeLog from '../models/IntakeLog.js';
import HarvestDeclaration from '../models/HarvestDeclaration.js';
import CropCycle from '../models/CropCycle.js';
import Shipment from '../models/Shipment.js';
import Farmer from '../models/Farmer.js';

export const getTraceabilityData = async (req, res) => {
    try {
        const { id } = req.params;
        let exportBatch = null;
        let processingBatch = null;

        if (id.startsWith('EB-')) {
            exportBatch = await ExportBatch.findOne({ batchId: id });
            if (!exportBatch) {
                return res.status(404).json({
                    status: 'fail',
                    message: `Export batch "${id}" not found.`
                });
            }
            // Try direct link
            processingBatch = await ProcessingBatch.findById(exportBatch.processingBatchId);
            // Fallback: find via cycleId if direct link is broken
            if (!processingBatch && exportBatch.cycleId) {
                processingBatch = await ProcessingBatch.findOne({
                    cycleId: exportBatch.cycleId,
                    status: 'Done'
                });
            }

        } else if (id.startsWith('STK-')) {
            processingBatch = await ProcessingBatch.findOne({ stockId: id });
            if (!processingBatch) {
                return res.status(404).json({
                    status: 'fail',
                    message: `Stock batch "${id}" not found.`
                });
            }
            exportBatch = await ExportBatch.findOne({
                $or: [
                    { processingBatchId: processingBatch._id },
                    { cycleId: processingBatch.cycleId }
                ]
            });

        } else {
            return res.status(400).json({
                status: 'fail',
                message: `Invalid ID format. Use EB-XXXXXX or STK-XXXXXX.`
            });
        }

        // Trace backwards
        const intake = processingBatch
            ? await IntakeLog.findById(processingBatch.intakeLogId)
            : null;

        const harvest = intake
            ? await HarvestDeclaration.findById(intake.harvestDeclarationId)
            : null;

        const cycleId = processingBatch?.cycleId || exportBatch?.cycleId;
        const cycle = cycleId ? await CropCycle.findById(cycleId) : null;
        const farmer = cycle?.farmer_id
            ? await Farmer.findById(cycle.farmer_id)
            : null;

        // Trace forwards
        const shipment = exportBatch
            ? await Shipment.findOne({ exportBatches: exportBatch._id })
            : null;

        const nodes = [];

        // Node 1 — Farm origin
        nodes.push({
            id: 'source',
            type: 'source',
            title: `Origin: ${harvest?.farmName || farmer?.cooperative_name || farmer?.full_name || 'Sarura Partner Farm'}`,
            details: [
                { label: 'Farmer',      value: farmer?.full_name || 'N/A' },
                { label: 'Crop',        value: harvest?.cropName || cycle?.crop_name || exportBatch?.cropName || 'N/A' },
                { label: 'Declared',    value: harvest?.createdAt ? new Date(harvest.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A' },
                { label: 'Location',    value: [farmer?.district, farmer?.sector].filter(Boolean).join(', ') || 'Rwanda' },
                { label: 'Est. Weight', value: harvest?.estimatedWeightKg ? `${harvest.estimatedWeightKg} kg` : 'N/A' },
            ],
            badges: [{ label: 'Farmer Status', value: farmer?.status || 'Active' }],
            action: { label: 'View Farmer Profile', link: farmer?._id ? `/pm/farmers?profileId=${farmer._id}` : '/pm/farmers' }
        });

        // Node 2 — Intake
        if (intake) {
            nodes.push({
                id: 'intake',
                type: 'intake',
                title: 'Field Pickup & Intake',
                details: [
                    { label: 'Arrived At',       value: intake.arrivedAt ? new Date(intake.arrivedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A' },
                    { label: 'Picked Up Weight', value: `${intake.pickedUpWeightKg} kg` },
                    { label: 'Truck',            value: intake.truckId || 'N/A' },
                ],
                action: null
            });
        }

        // Node 3 — Packhouse
        if (processingBatch) {
            nodes.push({
                id: 'stock',
                type: 'stock',
                title: `Packhouse: ${processingBatch.stockId || 'Processing Complete'}`,
                details: [
                    { label: 'Room',      value: processingBatch.assignedRoom || 'N/A' },
                    { label: 'Received',  value: processingBatch.receivedWeightKg ? `${processingBatch.receivedWeightKg} kg` : 'N/A' },
                    { label: 'Processed', value: processingBatch.processedWeightKg ? `${processingBatch.processedWeightKg} kg` : 'N/A' },
                    { label: 'Rejected',  value: processingBatch.rejectedWeightKg != null ? `${processingBatch.rejectedWeightKg} kg` : '0 kg' },
                    { label: 'Status',    value: processingBatch.status, highlight: processingBatch.status === 'Done' ? 'text-green-600 font-bold' : '' },
                ],
                action: null
            });
        }

        // Node 4 — Export batch
        if (exportBatch) {
            nodes.push({
                id: 'export',
                type: 'export',
                title: `Export Batch: ${exportBatch.batchId}`,
                details: [
                    { label: 'Client',      value: exportBatch.clientName },
                    { label: 'Destination', value: exportBatch.destination },
                    { label: 'Weight',      value: `${exportBatch.allocatedWeightKg} kg` },
                    { label: 'Boxes',       value: String(exportBatch.boxCount) },
                    { label: 'Grade',       value: exportBatch.gradeLabel || 'Grade A' },
                    { label: 'Status',      value: exportBatch.status, highlight: exportBatch.status === 'Shipped' ? 'text-green-600 font-bold' : '' },
                ],
                action: shipment
                    ? { label: `Shipment ${shipment.plNumber} — ${shipment.status}`, link: '/pm/inventory' }
                    : null
            });
        }

        // Node 5 — Shipment
        if (shipment) {
            nodes.push({
                id: 'shipment',
                type: 'shipment',
                title: `Shipment: ${shipment.plNumber}`,
                details: [
                    { label: 'Flight',       value: shipment.flightNumber },
                    { label: 'Destination',  value: shipment.destination },
                    { label: 'Departure',    value: shipment.departureDate ? new Date(shipment.departureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A' },
                    { label: 'Total Weight', value: `${shipment.totalWeightKg} kg` },
                    { label: 'Total Boxes',  value: String(shipment.totalBoxes) },
                    { label: 'Status',       value: shipment.status, highlight: shipment.status === 'Dispatched' ? 'text-green-600 font-bold' : '' },
                ],
                action: null
            });
        }

        res.status(200).json({
            status: 'success',
            data: { batchId: id, nodes }
        });

    } catch (err) {
        console.error('Traceability Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};
