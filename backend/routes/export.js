import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
    createExportBatch, getExportBatches, markReadyForExport,
    createShipment, getShipments, getShipmentById, dispatchShipment,
    uploadDocument, getDocuments,
} from '../controllers/exportController.js';

const router = express.Router();
router.use(protect);

// Export Batches
router.post('/export-batches', restrictTo('production_manager', 'admin'), createExportBatch);
router.get('/export-batches', restrictTo('production_manager', 'logistic_officer', 'admin'), getExportBatches);
router.patch('/export-batches/:id/ready', restrictTo('production_manager', 'admin'), markReadyForExport);

// Shipments
router.post('/shipments', restrictTo('logistic_officer', 'admin'), createShipment);
router.get('/shipments', restrictTo('logistic_officer', 'production_manager', 'admin'), getShipments);
router.get('/shipments/:id', restrictTo('logistic_officer', 'production_manager', 'admin'), getShipmentById);
router.patch('/shipments/:id/dispatch', restrictTo('logistic_officer', 'admin'), dispatchShipment);

// Export Documents
router.post('/export-documents', restrictTo('logistic_officer', 'admin'), uploadDocument);
router.get('/export-documents', restrictTo('logistic_officer', 'production_manager', 'admin'), getDocuments);

export default router;
