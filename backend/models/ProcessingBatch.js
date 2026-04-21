import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    intakeLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'IntakeLog', required: true },
    cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'CropCycle', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedRoom: { type: String },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receivedWeightKg: { type: Number },
    processedWeightKg: { type: Number },
    rejectedWeightKg: { type: Number },
    cropName: { type: String },
    status: {
        type: String,
        enum: ['RoomRequested', 'Processing', 'Done'],
        default: 'RoomRequested'
    },
}, { timestamps: true });
export default mongoose.model('ProcessingBatch', schema);