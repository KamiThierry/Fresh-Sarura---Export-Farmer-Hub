import mongoose from 'mongoose';

const cropCycleSchema = new mongoose.Schema({
    cycleId: { type: String, unique: true },   // auto-generated e.g. CC-001
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
    budget_categories: [
        {
            name: { type: String },
            allocated: { type: Number, default: 0 },
            spent: { type: Number, default: 0 },
        }
    ],
    status: { type: String, enum: ['active', 'harvesting', 'completed', 'cancelled'], default: 'active' },
    final_yield: { type: String },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// ── Pre-save hook ──────────────────────────────────────────────────────────────
cropCycleSchema.pre('save', async function (next) {
    // Auto-generate a human-readable cycleId on first save
    if (!this.cycleId) {
        const count = await mongoose.model('CropCycle').countDocuments();
        this.cycleId = `CC-${String(count + 1).padStart(3, '0')}`;
    }

    // Build budget_categories from the flat budget_* fields when first created
    if (this.isNew && (!this.budget_categories || this.budget_categories.length === 0)) {
        this.budget_categories = [
            { name: 'Seeds & Seedlings', allocated: this.budget_seeds      || 0, spent: 0 },
            { name: 'Fertilizers',       allocated: this.budget_fertilizers || 0, spent: 0 },
            { name: 'Chemicals',         allocated: this.budget_chemicals   || 0, spent: 0 },
            { name: 'Labor',             allocated: this.budget_labor       || 0, spent: 0 },
        ];
    }

    next();
});

const CropCycle = mongoose.model('CropCycle', cropCycleSchema);
export default CropCycle;