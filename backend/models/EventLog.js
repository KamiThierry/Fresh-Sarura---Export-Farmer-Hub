import mongoose from 'mongoose';

const eventLogSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    severity: {
        type: String,
        enum: ['INFO', 'WARNING', 'CRITICAL', 'DEBUG'],
        default: 'INFO'
    },
    description: {
        type: String,
        required: true
    },
    actor: {
        type: String,
        default: 'SYSTEM'
    },
    ip: {
        type: String,
        default: 'Unknown'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

const EventLog = mongoose.model('EventLog', eventLogSchema);

export default EventLog;
