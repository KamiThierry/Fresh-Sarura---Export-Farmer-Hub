import CropCycle from '../models/CropCycle.js';
import BudgetRequest from '../models/BudgetRequest.js';
import YieldForecast from '../models/YieldForecast.js';
import FieldReport from '../models/FieldReport.js';

// GET /api/v1/crop-cycles  (supports ?farmer_id=<id> filter)
export const getCropCycles = async (req, res) => {
    try {
        const filter = {};
        if (req.query.farmer_id) filter.farmer_id = req.query.farmer_id;
        const cycles = await CropCycle.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', results: cycles.length, data: cycles });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// POST /api/v1/crop-cycles
export const createCropCycle = async (req, res) => {
    try {
        console.log("POST /api/v1/crop-cycles payload:", req.body);
        const {
            farmer_id,
            farm_name,
            crop_name,
            season,
            planting_date,
            start_date,
            expected_harvest_date,
            block_name,
            block_size_hectares,
            field_size_hectares,
            total_budget,
            budget_seeds,
            budget_fertilizers,
            budget_chemicals,
            budget_labor,
            yield_goal_kg,
        } = req.body;

        // Validate required fields
        if (!farmer_id || !crop_name || !season || !planting_date || !start_date || !expected_harvest_date || !block_name || block_size_hectares === undefined || field_size_hectares === undefined || total_budget === undefined) {
            console.log("Validation failed on backend. Missing fields.");
            return res.status(400).json({
                status: 'error',
                message: 'farmer_id, crop_name, season, planting_date, start_date, expected_harvest_date, block_name, block_size_hectares, field_size_hectares, and total_budget are required.',
            });
        }

        const cycle = await CropCycle.create({
            farmer_id,
            farm_name: farm_name || '',
            crop_name,
            season,
            start_date: new Date(start_date),
            planting_date: new Date(planting_date),
            expected_harvest_date: new Date(expected_harvest_date),
            block_name: block_name || '',
            block_size_hectares: parseFloat(block_size_hectares) || 0,
            field_size_hectares: parseFloat(field_size_hectares) || 0,
            total_budget: parseFloat(total_budget) || 0,
            budget_seeds: parseFloat(budget_seeds) || 0,
            budget_fertilizers: parseFloat(budget_fertilizers) || 0,
            budget_chemicals: parseFloat(budget_chemicals) || 0,
            budget_labor: parseFloat(budget_labor) || 0,
            yield_goal_kg: yield_goal_kg ? parseFloat(yield_goal_kg) : undefined,
            registeredBy: req.user._id,
        });

        res.status(201).json({ status: 'success', message: 'Crop cycle created!', data: cycle });
    } catch (err) {
        console.error("Error creating crop cycle:", err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/crop-cycles/:id
export const updateCropCycle = async (req, res) => {
    try {
        const cycle = await CropCycle.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!cycle) return res.status(404).json({ status: 'error', message: 'Crop cycle not found.' });
        res.status(200).json({ status: 'success', data: cycle });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// DELETE /api/v1/crop-cycles/:id
export const deleteCropCycle = async (req, res) => {
    try {
        const cycle = await CropCycle.findByIdAndDelete(req.params.id);
        if (!cycle) return res.status(404).json({ status: 'error', message: 'Crop cycle not found.' });
        res.status(200).json({ status: 'success', message: 'Crop cycle deleted.' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/crop-cycles/:id/full  — returns cycle + all related sub-documents
export const getCropCycleFull = async (req, res) => {
    try {
        const cycle = await CropCycle.findById(req.params.id);
        if (!cycle) return res.status(404).json({ status: 'error', message: 'Cycle not found.' });

        const [budgetRequests, forecasts, fieldReports] = await Promise.all([
            BudgetRequest.find({ cycleId: req.params.id }).sort({ createdAt: -1 }),
            YieldForecast.find({ cycleId: req.params.id }).sort({ createdAt: -1 }),
            FieldReport.find({ cycleId: req.params.id }).sort({ createdAt: -1 }),
        ]);

        res.status(200).json({
            status: 'success',
            data: { cycle, budgetRequests, forecasts, fieldReports },
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/crop-cycles/:id/close
export const closeCropCycle = async (req, res) => {
    try {
        const { finalYield } = req.body;
        const cycle = await CropCycle.findByIdAndUpdate(
            req.params.id,
            { status: 'completed', final_yield: finalYield },
            { new: true }
        );
        if (!cycle) return res.status(404).json({ status: 'error', message: 'Cycle not found.' });
        res.status(200).json({ status: 'success', message: 'Cycle closed.', data: cycle });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/v1/crop-cycles/budget-requests/pending
export const getPendingBudgetRequests = async (req, res) => {
    try {
        const requests = await BudgetRequest.find({ approvalStatus: 'Pending' }).sort({ createdAt: -1 });

        const populatedRequests = await Promise.all(requests.map(async (r) => {
            const reqObj = r.toObject();
            const cycle = await CropCycle.findById(r.cycleId);
            
            reqObj.farm_name = cycle?.farm_name || cycle?.block_name || 'Farm';
            reqObj.cycle_budget_categories = cycle?.budget_categories || [];
            reqObj.cycle_total_budget = cycle?.total_budget || 0;
            reqObj.cycle_spent = cycle?.spent || 0;
            
            return reqObj;
        }));

        res.status(200).json({ status: 'success', data: populatedRequests });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/budget-requests/:id/approve
export const approveBudgetRequest = async (req, res) => {
    try {
        const request = await BudgetRequest.findByIdAndUpdate(
            req.params.id,
            { approvalStatus: 'Approved', pmNote: req.body.pmNote || '' },
            { new: true }
        );
        if (!request) return res.status(404).json({ status: 'error', message: 'Request not found.' });

        // Update the crop cycle buckets automatically
        const cycle = await CropCycle.findById(request.cycleId);
        if (cycle && cycle.budget_categories) {
            let totalAdded = 0;
            // Iterate and update the categories
            const updatedCategories = cycle.budget_categories.map(cat => {
                const matchingItems = request.lineItems.filter(item => item.category === cat.name);
                const sumForCat = matchingItems.reduce((acc, item) => acc + (item.estimatedCostRwf || 0), 0);
                
                totalAdded += sumForCat;
                return {
                    ...cat.toObject(),
                    approved: (cat.approved || 0) + sumForCat
                };
            });

            cycle.budget_categories = updatedCategories;
            cycle.approved = (cycle.approved || 0) + totalAdded;
            await cycle.save();
        }

        res.status(200).json({ status: 'success', data: request });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/budget-requests/:id/reject
export const rejectBudgetRequest = async (req, res) => {
    try {
        const request = await BudgetRequest.findByIdAndUpdate(
            req.params.id,
            { approvalStatus: 'Rejected', pmNote: req.body.pmNote || '' },
            { new: true }
        );
        if (!request) return res.status(404).json({ status: 'error', message: 'Request not found.' });
        res.status(200).json({ status: 'success', data: request });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/yield-forecasts/:id/verify
export const verifyForecast = async (req, res) => {
    try {
        const forecast = await YieldForecast.findByIdAndUpdate(
            req.params.id,
            { status: 'Verified', pmReply: req.body.pmReply || '' },
            { new: true }
        );
        if (!forecast) return res.status(404).json({ status: 'error', message: 'Forecast not found.' });
        res.status(200).json({ status: 'success', data: forecast });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/field-reports/:id/flag
export const flagFieldReport = async (req, res) => {
    try {
        const report = await FieldReport.findByIdAndUpdate(
            req.params.id,
            { status: 'Flagged', pmFlag: req.body.reason },
            { new: true }
        );
        if (!report) return res.status(404).json({ status: 'error', message: 'Report not found.' });
        res.status(200).json({ status: 'success', data: report });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// PATCH /api/v1/crop-cycles/:id/adjust-budget
export const adjustBudget = async (req, res) => {
    try {
        const { categoryName, newAllocated } = req.body;
        const cycle = await CropCycle.findById(req.params.id);
        if (!cycle) return res.status(404).json({ status: 'error', message: 'Cycle not found.' });

        const existing = cycle.budget_categories || [];
        const updated = existing.map(cat =>
            cat.name === categoryName ? { ...cat.toObject(), allocated: newAllocated } : cat
        );
        cycle.budget_categories = updated;
        await cycle.save();
        res.status(200).json({ status: 'success', data: cycle });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
}