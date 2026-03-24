const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerCareRuleSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    rule_name: { type: String, required: true, trim: true },
    target_audience: { type: String, trim: true },
    conditions: { type: Schema.Types.Mixed, required: true },
    action: { type: Schema.Types.Mixed, required: true },
    is_active: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

customerCareRuleSchema.index({ location_id: 1 });
customerCareRuleSchema.index({ is_active: 1 });

module.exports = mongoose.model('CustomerCareRule', customerCareRuleSchema);
