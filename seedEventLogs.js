import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EventLog from './backend/models/EventLog.js';

dotenv.config();

const seedLogs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const logs = [
            { severity: 'CRITICAL', description: 'Multiple failed login attempts', actor: 'Unknown', ip: '197.243.22.10' },
            { severity: 'INFO', description: "Master Data 'Crop' updated", actor: 'Super Admin', ip: '10.0.0.45' },
            { severity: 'WARNING', description: 'Export batch #B-2026-001 canceled', actor: 'Production Manager', ip: '10.0.1.12' },
            { severity: 'INFO', description: 'System automated backup completed', actor: 'SYSTEM', ip: 'localhost' },
            { severity: 'INFO', description: 'New account approved (Simbi Farm)', actor: 'Super Admin', ip: '10.0.0.45' },
            { severity: 'CRITICAL', description: 'Database connection limit reached', actor: 'SYSTEM', ip: '127.0.0.1' },
            { severity: 'INFO', description: 'New farmer registered: Gatera John', actor: 'Production Manager', ip: '10.0.1.15' },
            { severity: 'WARNING', description: 'High memory usage detected', actor: 'SYSTEM', ip: '127.0.0.1' },
        ];

        await EventLog.deleteMany({});
        await EventLog.insertMany(logs);

        console.log('Event logs seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedLogs();
