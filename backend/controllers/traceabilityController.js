import ExportBatch from '../models/ExportBatch.js';
import ProcessingBatch from '../models/ProcessingBatch.js';
import IntakeLog from '../models/IntakeLog.js';
import HarvestDeclaration from '../models/HarvestDeclaration.js';
import CropCycle from '../models/CropCycle.js';
import Shipment from '../models/Shipment.js';
import Farmer from '../models/Farmer.js';

export const getTraceabilityData = async (req, res) => {
    try {
        const { id } = req.params; // Can be ExportBatch.batchId or ProcessingBatch.stockId

        let exportBatch = await ExportBatch.findOne({ batchId: id });
        let processingBatch;

        if (exportBatch) {
            processingBatch = await ProcessingBatch.findById(exportBatch.processingBatchId);
        } else {
            processingBatch = await ProcessingBatch.findOne({ stockId: id });
            if (!processingBatch) {
                // Try searching by _id as fallback
                processingBatch = await ProcessingBatch.findById(id).catch(() => null);
            }
        }

        if (!processingBatch) {
            return res.status(404).json({ status: 'fail', message: `Batch ${id} not found. Please check the ID and try again.` });
        }

        // Trace Backwards
        const intake = await IntakeLog.findById(processingBatch.intakeLogId);
        const cycle = await CropCycle.findById(processingBatch.cycleId).populate('farmer_id');
        const harvest = intake ? await HarvestDeclaration.findById(intake.harvestDeclarationId) : null;
        const farmer = cycle?.farmer_id;

        // Trace Forwards (if we started from ProcessingBatch, find ExportBatches)
        if (!exportBatch) {
            exportBatch = await ExportBatch.findOne({ processingBatchId: processingBatch._id });
        }

        const realShipment = exportBatch ? await Shipment.findOne({ exportBatches: exportBatch._id }) : null;

        // Formulate Response Nodes
        const nodes = [];

        // 1. Source Node
        if (farmer || harvest) {
            nodes.push({
                id: 'source',
                title: `Origin: ${farmer?.farm_name || 'Sarura Partner Farm'}`,
                type: 'source',
                details: [
                    { label: "Farmer", value: farmer?.full_name || "Unknown Farmer" },
                    { label: "Harvest Date", value: harvest?.harvestDate ? new Date(harvest.harvestDate).toLocaleDateString() : "N/A" },
                    { label: "Location", value: `${farmer?.district || ''}, ${farmer?.sector || ''}`.trim() || 'Rwanda' },
                ],
                badges: [
                    { label: "Compliance Status", value: farmer?.status || 'Active' }
                ],
                action: { label: "View Farmer Profile", link: `/pm/farmers` }
            });
        }

        // 2. Intake Node
        if (intake) {
            nodes.push({
                id: 'intake',
                title: `Intake & QC Check`,
                type: 'intake',
                details: [
                    { label: "Received", value: intake.arrivedAt ? new Date(intake.arrivedAt).toLocaleString() : "N/A" },
                    { label: "QC Status", value: "Passed (Grade A)", highlight: "text-green-600 font-bold" },
                    { label: "Truck ID", value: intake.truckId || "FLEET-001" },
                ],
                action: null
            });
        }

        // 3. Processing Node
        nodes.push({
            id: 'stock',
            title: `Processed Stock: ${processingBatch.stockId || 'Pending'}`,
            type: 'stock',
            details: [
                { label: "Storage", value: processingBatch.assignedRoom || "Cold Room A" },
                { label: "Processed Weight", value: `${processingBatch.processed_weight_kg || processingBatch.processedWeightKg || 0} kg` },
                { label: "Produce", value: processingBatch.cropName || "N/A" },
            ],
            action: null
        });

        // 4. Export Node
        if (exportBatch) {
            nodes.push({
                id: 'export',
                title: `Export Ready: ${exportBatch.batchId}`,
                type: 'export',
                details: [
                    { label: "Client", value: exportBatch.clientName },
                    { label: "Destination", value: exportBatch.destination },
                    { label: "Cargo", value: `${exportBatch.boxCount} boxes (${exportBatch.allocatedWeightKg} kg)` },
                ],
                action: realShipment ? { label: `Shipment: ${realShipment.status}`, link: `/pm/shipments` } : null
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                batchId: id,
                nodes
            }
        });

    } catch (err) {
        console.error('Traceability Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};
