import mongoose from 'mongoose';

const cropCycleSchema = new mongoose.Schema({
    farm_name: { type: String },
    crop_name: { type: String, required: true },
    season: { type: String, required: true },
    farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    field_size_hectares: { type: Number, required: true },
    planting_date: { type: Date, required: true },
    start_date: { type: Date, required: true },
    expected_harvest_date: { type: Date, required: true },
    block_name: { type: String, required: true },
    block_size_hectares: { type: Number, required: true },
    total_budget: { type: Number, required: true },
    budget_seeds: { type: Number, required: true },
    budget_fertilizers: { type: Number, required: true },
    budget_chemicals: { type: Number, required: true },
    budget_labor: { type: Number, required: true },
    yield_goal_kg: { type: Number },
    status: { type: String, enum: ['active', 'harvesting', 'completed', 'cancelled'], default: 'active' },
    final_yield: { type: String },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true }
)

const CropCycle = mongoose.model('CropCycle', cropCycleSchema);
export default CropCycle;