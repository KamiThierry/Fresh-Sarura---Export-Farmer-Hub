import Farmer from '../models/Farmer.js';
import logger from '../utils/logger.js';
import User from '../models/User.js';
import { sendFarmerWelcomeEmail } from '../utils/emailService.js';

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
    let farmerUser;
    let newlyCreatedUser = false;
    try {
        const {
            full_name, farm_name, national_id, district, sector, cell, village,
            produce_types, farm_size_hectares, production_capacity_tons, phone, email
        } = req.body;

        if (!full_name || !district || !sector || !cell || !village || !national_id || !phone || !farm_size_hectares || !email) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        // 1. Check if Farmer already exists with this email
        const existingFarmer = await Farmer.findOne({ email });
        if (existingFarmer) {
            return res.status(400).json({ message: 'A farmer with this email is already registered' });
        }

        // 2. Check if User already exists
        farmerUser = await User.findOne({ email });
        
        // Generate temporary password (used if creating new or if user needs it sent again)
        const tempPassword = `Farm${Math.random().toString(36).slice(-6).toUpperCase()}@2026`;

        if (!farmerUser) {
            // Create farmer User account if not exists
            farmerUser = await User.create({
                name: full_name,
                email,
                password: tempPassword,
                phone,
                role: 'farm_manager',
                isActive: true,
            });
            newlyCreatedUser = true;
        } else {
            // Update existing user's password to match the one we're emailing
            farmerUser.password = tempPassword;
            await farmerUser.save();
            logger.info(`Updated password for existing user and linking to new farmer: ${email}`);
        }

        // 3. Create farmer record
        try {
            const farmer = await Farmer.create({
                full_name,
                farm_name,
                national_id,
                district,
                sector,
                cell,
                village,
                produce_types,
                farm_size_hectares,
                production_capacity_tons,
                phone,
                email,
                userId: farmerUser._id,
                registeredBy: req.user._id,
            });

            // 4. Send welcome email - try/catch to prevent email failure from rolling back registration
            try {
                await sendFarmerWelcomeEmail({
                    farmerName: full_name,
                    email,
                    password: tempPassword,
                });
            } catch (emailError) {
                logger.error(`Farmer registered but welcome email failed: ${emailError.message}`);
            }

            logger.info(`Farmer registered: ${farmer.full_name} by ${req.user.email}`);

            res.status(201).json({
                message: 'Farmer registered successfully!',
                farmer,
            });
        } catch (farmerError) {
            // ROLLBACK: If farmer creation fails and we JUST created the user in this request, delete the user
            if (newlyCreatedUser && farmerUser) {
                await User.findByIdAndDelete(farmerUser._id);
                logger.warn(`Rollback: Deleted orphaned user ${email} due to farmer registration failure`);
            }
            throw farmerError;
        }
    } catch (error) {
        logger.error('Register farmer error:', error.message);
        res.status(500).json({ message: error.message || 'Server error registering farmer' });
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