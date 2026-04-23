const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerCareRuleSchema = new Schema({
    location_id: { type: String, ref: 'Location', required: true },
    category: { type: String, enum: ['retention', 'zone', 'revenue'], required: true },
    rule_id: { type: String, required: true, uppercase: true, trim: true },
    rule_name: { type: String, required: true },
    logic: {
        metric_name: { type: String, required: true },
        operator: { type: String, enum: ['>', '<', '>=', '<='], required: true },
        threshold: { type: Number, required: true },
        unit: { type: String },
    },
    zone_id: { type: String },
    action: { type: String, required: true },
    is_active: { type: Boolean, default: true },

}, { timestamps: true });

customerCareRuleSchema.index({ location_id: 1, category: 1, is_active: 1 });

module.exports = mongoose.model('CustomerCareRule', customerCareRuleSchema);
