import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';
import { createEventLog } from './eventLogController.js';

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
            await createEventLog({
                module: 'User Management',
                action: 'Failed Login',
                severity: 'CRITICAL',
                description: `Failed login attempt for email: ${email}`,
                actor: 'Unknown',
                ip: req.ip || req.connection.remoteAddress
            });
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            await createEventLog({
                module: 'User Management',
                action: 'Blocked Login',
                severity: 'WARNING',
                description: `Login attempt for deactivated account: ${email}`,
                actor: user.name,
                ip: req.ip || req.connection.remoteAddress
            });
            return res.status(403).json({ message: 'Your account has been deactivated' });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        logger.info(`User logged in: ${user.email} (${user.role})`);
        await createEventLog({
            module: 'User Management',
            action: 'User Login',
            severity: 'INFO',
            description: `User logged in: ${user.email} (${user.role})`,
            actor: user.name,
            ip: req.ip || req.connection.remoteAddress,
            metadata: { role: user.role, email: user.email }
        });

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

        await createEventLog({
            module: 'User Management',
            action: 'User Created',
            severity: 'INFO',
            description: `Admin created new user: ${user.email} with role ${user.role}`,
            actor: req.user?.name || 'Admin',
            metadata: { userId: user._id, role: user.role }
        });

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

        await createEventLog({
            module: 'User Management',
            action: 'User Registered',
            severity: 'INFO',
            description: `New user registered: ${user.email} as ${user.role}`,
            actor: user.name,
            metadata: { userId: user._id, role: user.role }
        });

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

// @route POST /api/v1/auth/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found with this email address' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Hash it and set expiry (1 hour)
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 3600000;

        await user.save({ validateBeforeSave: false });

        // Send email
        await sendPasswordResetEmail({
            email: user.email,
            resetToken,
            userName: user.name
        });

        res.status(200).json({ message: 'Reset link sent to your email' });
    } catch (error) {
        logger.error('Forgot password error:', error.message);
        res.status(500).json({ message: 'Error sending reset email' });
    }
};

// @route POST /api/v1/auth/reset-password
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Hash provided token to compare with DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user by hashed token and check expiry
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }

        // Update password and clear reset fields
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        logger.error('Reset password error:', error.message);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

// @route GET /api/v1/auth/users  (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(`${endDate}T23:59:59.999Z`)
            };
        }
        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json({ status: 'success', results: users.length, data: users });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// @route PATCH /api/v1/auth/users/:id  (Admin only)
export const updateUser = async (req, res) => {
    try {
        const { name, role, isActive, phone } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, role, isActive, phone },
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

        await createEventLog({
            module: 'User Management',
            action: 'User Updated',
            severity: 'INFO',
            description: `User account updated: ${user.email} — role: ${user.role}, active: ${user.isActive}`,
            actor: req.user?.name || 'Admin',
            metadata: { userId: user._id, changes: { name, role, isActive } }
        });
        res.json({ status: 'success', data: user });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// @route DELETE /api/v1/auth/users/:id  (Admin only — soft delete)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

        await createEventLog({
            module: 'User Management',
            action: 'User Deactivated',
            severity: 'WARNING',
            description: `User account deactivated: ${user.email}`,
            actor: req.user?.name || 'Admin',
            metadata: { userId: user._id }
        });
        res.json({ status: 'success', message: 'User deactivated.' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};