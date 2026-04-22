import express from 'express';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import farmerRoutes from './farmers.js';
import cropCycleRoutes from './CropCycle.js';
import farmManagerRoutes from './farmManager.js';
import harvestRoutes from './harvest.js';
import processingBatchRoutes from './processingBatches.js';
import stockRoutes from './stock.js';
import notificationRoutes from './notifications.js';
import roomRoutes from './rooms.js';

const router = express.Router();
const apiVersion = '/api/v1';

router.use(`${apiVersion}/health`, healthRoutes);
router.use(`${apiVersion}/auth`, authRoutes);
router.use(`${apiVersion}/farmers`, farmerRoutes);
router.use(`${apiVersion}/crop-cycles`, cropCycleRoutes);
router.use(`${apiVersion}/farm-manager`, farmManagerRoutes);
router.use(`${apiVersion}/harvest-declarations`, harvestRoutes);
router.use(`${apiVersion}/processing-batches`, processingBatchRoutes);
router.use(`${apiVersion}/stock`, stockRoutes);
router.use(`${apiVersion}/notifications`, notificationRoutes);
router.use(`${apiVersion}/rooms`, roomRoutes);

export default router;