import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// @route POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated' });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        logger.info(`User logged in: ${user.email} (${user.role})`);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @route POST /api/auth/create-user (Admin only)
export const createUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = await User.create({ name, email, password, phone, role });

        logger.info(`New user created: ${user.email} (${user.role})`);

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error('Create user error:', error.message);
        res.status(500).json({ message: 'Server error during user creation' });
    }
};

// @route GET /api/auth/me
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @route POST /api/v1/auth/register (Public signup)
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const user = await User.create({ name, email, password, phone, role, isActive: true });

        logger.info(`New user registered: ${user.email} (${user.role})`);

        res.status(201).json({
            message: 'Registration successful!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error('Register error:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: message.join(', ') });
        }
        
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @route PATCH /api/auth/me
export const updateMe = async (req, res) => {
    try {
        const { name, email, phone, preferences } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, phone, preferences },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        logger.error('Update me error:', error.message);
        res.status(500).json({ message: 'Server error during profile update' });
    }
};

// @route PATCH /api/auth/update-password
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        logger.info(`Password update attempt for user: ${req.user.id}`);

        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            logger.warn(`Password mismatch for user: ${req.user.id}`);
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save();

        logger.info(`Password updated successfully for user: ${req.user.id}`);
        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (error) {
        logger.error('Update password error:', error.message);
        res.status(500).json({ message: error.message || 'Server error during password update' });
    }
};