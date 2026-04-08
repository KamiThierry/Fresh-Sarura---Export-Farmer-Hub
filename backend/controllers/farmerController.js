import Farmer from '../models/Farmer.js';
import logger from '../utils/logger.js';

// @route GET /api/v1/farmers
export const getFarmers = async (req, res) => {
    try {
        const farmers = await Farmer.find().sort({ createdAt: -1 });
        res.status(200).json({ farmers });
    } catch (error) {
        logger.error('Get farmers error:', error.message);
        res.status(500).json({ message: 'Server error fetching farmers' });
    }
};

// @route POST /api/v1/farmers
export const registerFarmer = async (req, res) => {
    try {
        const {
            full_name, email, national_id, farm_name,
            district, sector, cell, village,
            produce_types, farm_size_hectares, production_capacity_tons, phone
        } = req.body;

        if (!full_name || !email || !national_id || !district || !sector || !cell || !village || !phone || !farm_size_hectares) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        const farmer = await Farmer.create({
            full_name,
            email,
            national_id,
            farm_name,
            district,
            sector,
            cell,
            village,
            produce_types,
            farm_size_hectares,
            production_capacity_tons,
            phone,
            registeredBy: req.user._id,
        });

        logger.info(`Farmer registered: ${farmer.full_name} by ${req.user.email}`);

        res.status(201).json({
            message: 'Farmer registered successfully',
            farmer,
        });
    } catch (error) {
        logger.error('Register farmer error:', error.message);
        res.status(500).json({ message: 'Server error registering farmer' });
    }
};

// @route DELETE /api/v1/farmers/:id
export const deleteFarmer = async (req, res) => {
    try {
        const farmer = await Farmer.findByIdAndDelete(req.params.id);
        if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
        res.status(200).json({ message: 'Farmer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting farmer' });
    }
};