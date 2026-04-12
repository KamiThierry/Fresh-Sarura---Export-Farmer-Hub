import express from 'express';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import farmerRoutes from './farmers.js';
import cropCycleRoutes from './CropCycle.js';
import farmManagerRoutes from './farmManager.js';

const router = express.Router();
const apiVersion = '/api/v1';

router.use(`${apiVersion}/health`, healthRoutes);
router.use(`${apiVersion}/auth`, authRoutes);
router.use(`${apiVersion}/farmers`, farmerRoutes);
router.use(`${apiVersion}/crop-cycles`, cropCycleRoutes);
router.use(`${apiVersion}/farm-manager`, farmManagerRoutes);

export default router;