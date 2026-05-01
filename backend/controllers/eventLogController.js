import EventLog from '../models/EventLog.js';
import logger from '../utils/logger.js';

// @desc    Get all event logs
// @route   GET /api/v1/event-logs
// @access  Private (Admin)
export const getAllLogs = async (req, res) => {
    try {
        const { module, action, actor, search } = req.query;
        let query = {};

        if (module && module !== 'All') query.module = module;
        if (action && action !== 'All') query.action = action;
        if (actor && actor !== 'All') query.actor = actor;

        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { actor: { $regex: search, $options: 'i' } },
                { action: { $regex: search, $options: 'i' } }
            ];
        }

        const logs = await EventLog.find(query).sort({ timestamp: -1 });

        res.status(200).json({
            status: 'success',
            results: logs.length,
            data: logs
        });
    } catch (error) {
        logger.error('Get all logs error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Server error fetching event logs'
        });
    }
};

// Helper function to create a log (can be imported by other controllers)
export const createEventLog = async (data) => {
    try {
        await EventLog.create(data);
    } catch (error) {
        logger.error('Create event log error:', error.message);
    }
};
