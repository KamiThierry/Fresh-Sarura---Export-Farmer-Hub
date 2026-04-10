import CropCycle from '../models/CropCycle.js';

// GET /api/v1/crop-cycles
export const getCropCycles = async (req, res) => {
    try {
        const cycles = await CropCycle.find().sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', results: cycles.length, data: cycles });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// POST /api/v1/crop-cycles
export const createCropCycle = async (req, res) => {
    try {
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
        } = req.body;

        // Validate required fields (mirrors model's required: true)
        if (
            !farmer_id || !crop_name || !season ||
            !planting_date || !start_date || !expected_harvest_date ||
            !block_name || !block_size_hectares || !field_size_hectares ||
            !total_budget
        ) {
            return res.status(400).json({
                status: 'error',
                message: 'All required fields must be provided: farmer_id, crop_name, season, planting_date, start_date, expected_harvest_date, block_name, block_size_hectares, field_size_hectares, total_budget.',
            });
        }

        const cycle = await CropCycle.create({
            farmer_id,
            farm_name: farm_name || '',
            crop_name,
            season,
            planting_date: new Date(planting_date),
            start_date: new Date(start_date),
            expected_harvest_date: new Date(expected_harvest_date),
            block_name,
            block_size_hectares: parseFloat(block_size_hectares) || 0,
            field_size_hectares: parseFloat(field_size_hectares) || 0,
            total_budget: parseFloat(total_budget) || 0,
            budget_seeds: parseFloat(budget_seeds) || 0,
            budget_fertilizers: parseFloat(budget_fertilizers) || 0,
            budget_chemicals: parseFloat(budget_chemicals) || 0,
            budget_labor: parseFloat(budget_labor) || 0,
            registeredBy: req.user._id,
        });

        res.status(201).json({ status: 'success', message: 'Crop cycle created!', data: cycle });
    } catch (err) {
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