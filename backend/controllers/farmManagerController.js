import Farmer from '../models/Farmer.js';
import CropCycle from '../models/CropCycle.js';
import BudgetRequest from '../models/BudgetRequest.js';
import YieldForecast from '../models/YieldForecast.js';
import FieldReport from '../models/FieldReport.js';

// ── Helper: find the Farmer doc linked to the logged-in user ──────────
const getMyFarmer = async (userId) => {
    const farmer = await Farmer.findOne({ userId });
    if (!farmer) throw new Error('NO_FARMER_PROFILE');
    return farmer;
};

// GET /api/v1/farm-manager/profile
// Returns the Farmer document for the logged-in FM
export const getMyProfile = async (req, res) => {
    try {
        const farmer = await getMyFarmer(req.user._id);
        res.status(200).json({ status: 'success', data: farmer });
    } catch (err) {
        if (err.message === 'NO_FARMER_PROFILE') {
            return res.status(404).json({ status: 'error', message: 'No farmer profile linked to this account.' });
        }
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/farm-manager/dashboard
// Returns profile + active cycles + summary counts in one call
export const getDashboard = async (req, res) => {
    try {
        const farmer = await getMyFarmer(req.user._id);

        // Cycles linked to this farmer directly via the farmer_id field
        const cycles = await CropCycle.find({ farmer_id: farmer._id }).sort({ createdAt: -1 });

        const [pendingRequests, pendingForecasts] = await Promise.all([
            BudgetRequest.countDocuments({
                submittedBy: req.user._id,
                approvalStatus: 'Pending'
            }),
            YieldForecast.countDocuments({
                submittedBy: req.user._id,
                status: 'Pending'
            }),
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                farmer,
                cycles,
                summary: {
                    activeCycles: cycles.filter(c => c.status === 'Active').length,
                    pendingRequests,
                    pendingForecasts,
                    totalCycles: cycles.length,
                }
            }
        });
    } catch (err) {
        if (err.message === 'NO_FARMER_PROFILE') {
            return res.status(404).json({ status: 'error', message: 'No farmer profile linked to this account.' });
        }
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/farm-manager/cycles
// All crop cycles visible to this FM
export const getMyCycles = async (req, res) => {
    try {
        const farmer = await getMyFarmer(req.user._id);

        // Fetch using exact farmer_id assignment
        const cycles = await CropCycle.find({ farmer_id: farmer._id }).sort({ createdAt: -1 });

        // For each cycle, also pull the FM's budget requests
        const cyclesWithRequests = await Promise.all(
            cycles.map(async (cycle) => {
                const requests = await BudgetRequest.find({
                    cycleId: cycle._id,
                    submittedBy: req.user._id,
                }).sort({ createdAt: -1 });

                const fieldReports = await FieldReport.find({
                    cycleId: cycle._id,
                    submittedBy: req.user._id,
                }).sort({ createdAt: -1 });

                return {
                    ...cycle.toObject(),
                    myRequests: requests,
                    myFieldReports: fieldReports,
                };
            })
        );

        res.status(200).json({
            status: 'success',
            results: cyclesWithRequests.length,
            data: cyclesWithRequests,
        });
    } catch (err) {
        if (err.message === 'NO_FARMER_PROFILE') {
            return res.status(404).json({ status: 'error', message: 'No farmer profile linked to this account.' });
        }
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// POST /api/v1/farm-manager/budget-requests
// FM submits a budget + activity request for PM approval
export const submitBudgetRequest = async (req, res) => {
    try {
        const { cycleId, cycleName, startDate, endDate, lineItems } = req.body;

        if (!cycleId || !startDate || !endDate || !lineItems?.length) {
            return res.status(400).json({ status: 'error', message: 'cycleId, startDate, endDate, and lineItems are required.' });
        }

        const totalRequestedRwf = lineItems.reduce(
            (sum, item) => sum + (item.estimatedCostRwf || 0), 0
        );

        const request = await BudgetRequest.create({
            cycleId,
            cycleName,
            submittedBy: req.user._id,
            submittedByName: req.user.name,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            lineItems,
            totalRequestedRwf,
            approvalStatus: 'Pending',
        });

        res.status(201).json({
            status: 'success',
            message: 'Budget request submitted. Awaiting PM approval.',
            data: request,
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/farm-manager/budget-requests
// FM sees all their own requests across all cycles
export const getMyBudgetRequests = async (req, res) => {
    try {
        const requests = await BudgetRequest.find({ submittedBy: req.user._id })
            .sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', results: requests.length, data: requests });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// POST /api/v1/farm-manager/field-reports
// FM logs actual expense/activity completion after work is done
export const submitFieldReport = async (req, res) => {
    try {
        const {
            cycleId, budgetRequestId, description,
            category, block, approvedAmountRwf,
            actualCostRwf, notes, hasProof
        } = req.body;

        if (!cycleId || !description || !actualCostRwf) {
            return res.status(400).json({ status: 'error', message: 'cycleId, description, and actualCostRwf are required.' });
        }

        const report = await FieldReport.create({
            cycleId,
            budgetRequestId: budgetRequestId || null,
            submittedBy: req.user._id,
            submittedByName: req.user.name,
            description,
            category,
            block,
            approvedAmountRwf: approvedAmountRwf || 0,
            actualCostRwf,
            notes,
            hasProof: hasProof || false,
            status: 'Submitted',
        });

        // Update the cycle's spent total
        await CropCycle.findByIdAndUpdate(cycleId, {
            $inc: { spent: actualCostRwf }
        });

        res.status(201).json({
            status: 'success',
            message: 'Field report submitted successfully.',
            data: report,
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/farm-manager/field-reports
export const getMyFieldReports = async (req, res) => {
    try {
        const reports = await FieldReport.find({ submittedBy: req.user._id })
            .sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', results: reports.length, data: reports });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// POST /api/v1/farm-manager/yield-forecasts
export const submitYieldForecast = async (req, res) => {
    try {
        const { cycleId, harvestDate, predictionKg, confidence, notes } = req.body;

        if (!cycleId || !harvestDate || !predictionKg) {
            return res.status(400).json({ status: 'error', message: 'cycleId, harvestDate, and predictionKg are required.' });
        }

        const forecast = await YieldForecast.create({
            cycleId,
            submittedBy: req.user._id,
            submittedByName: req.user.name,
            harvestDate: new Date(harvestDate),
            predictionKg,
            confidence: confidence || 'Medium',
            notes,
            status: 'Pending',
        });

        // Also update cycle's yield_goal with latest forecast
        await CropCycle.findByIdAndUpdate(cycleId, {
            yield_goal: `${Number(predictionKg).toLocaleString()} kg`
        });

        res.status(201).json({
            status: 'success',
            message: 'Yield forecast submitted. Awaiting PM verification.',
            data: forecast,
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/farm-manager/yield-forecasts
export const getMyYieldForecasts = async (req, res) => {
    try {
        const forecasts = await YieldForecast.find({ submittedBy: req.user._id })
            .sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', results: forecasts.length, data: forecasts });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};