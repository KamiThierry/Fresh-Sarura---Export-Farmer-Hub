import Farmer from '../models/Farmer.js';
import CropCycle from '../models/CropCycle.js';
import BudgetRequest from '../models/BudgetRequest.js';
import YieldForecast from '../models/YieldForecast.js';
import User from '../models/User.js';

export const getActivityStats = async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 3;
        
        const now = new Date();
        const data = [];

        for (let i = months - 1; i >= 0; i--) {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
            
            const monthLabel = startOfMonth.toLocaleString('default', { month: 'short' });

            const farmersCount = await Farmer.countDocuments({
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            });

            const cyclesCount = await CropCycle.countDocuments({
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            });

            data.push({
                month: monthLabel,
                farmers: farmersCount,
                cycles: cyclesCount
            });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('getActivityStats Error:', error);
        res.status(500).json({ message: 'Failed to get activity stats' });
    }
};

export const getCycleStats = async (req, res) => {
    try {
        const active = await CropCycle.countDocuments({ status: 'active' });
        const harvesting = await CropCycle.countDocuments({ status: 'in_progress' });
        const planned = await CropCycle.countDocuments({ status: 'planned' });
        const completed = await CropCycle.countDocuments({ status: 'completed' });

        res.status(200).json({ active, harvesting, planned, completed });
    } catch (error) {
        console.error('getCycleStats Error:', error);
        res.status(500).json({ message: 'Failed to get cycle stats' });
    }
};

export const getRecentActivity = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const farmers = await Farmer.find().sort({ createdAt: -1 }).limit(limit).populate('registeredBy', 'name email').lean();
        const formattedFarmers = farmers.map(f => ({
            id: f._id,
            type: 'farmer',
            time: f.createdAt,
            actor: f.registeredBy?.name || 'System',
            event: `Registered new farmer: ${f.full_name}`,
            status: 'Success'
        }));

        const budgets = await BudgetRequest.find().sort({ createdAt: -1 }).limit(limit).populate('submittedBy', 'name email').lean();
        const formattedBudgets = budgets.map(b => ({
            id: b._id,
            type: 'budget',
            time: b.createdAt,
            actor: b.submittedByName || b.submittedBy?.name || 'System',
            event: `Budget request ${b.approvalStatus.toLowerCase()}`,
            status: b.approvalStatus
        }));

        const yields = await YieldForecast.find().sort({ createdAt: -1 }).limit(limit).populate('submittedBy', 'name email').lean();
        const formattedYields = yields.map(y => ({
            id: y._id,
            type: 'yield',
            time: y.createdAt,
            actor: y.submittedByName || y.submittedBy?.name || 'System',
            event: `Yield forecast ${y.status.toLowerCase()}`,
            status: y.status
        }));

        const cycles = await CropCycle.find().sort({ createdAt: -1 }).limit(limit).populate('registeredBy', 'name email').lean();
        const formattedCycles = cycles.map(c => ({
            id: c._id,
            type: 'cycle',
            time: c.createdAt,
            actor: c.registeredBy?.name || 'System',
            event: `Crop cycle ${c.status.toLowerCase()}`,
            status: c.status.charAt(0).toUpperCase() + c.status.slice(1)
        }));

        const users = await User.find().sort({ createdAt: -1 }).limit(limit).lean();
        const formattedUsers = users.map(u => ({
            id: u._id,
            type: 'user',
            time: u.createdAt,
            actor: 'System Admin',
            event: `New user account created: ${u.name}`,
            status: 'Success'
        }));

        const combined = [
            ...formattedFarmers,
            ...formattedBudgets,
            ...formattedYields,
            ...formattedCycles,
            ...formattedUsers
        ];

        combined.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        const topRecent = combined.slice(0, limit);

        res.status(200).json(topRecent);
    } catch (error) {
        console.error('getRecentActivity Error:', error);
        res.status(500).json({ message: 'Failed to get recent activity' });
    }
};
