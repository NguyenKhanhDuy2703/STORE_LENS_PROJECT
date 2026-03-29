const mongoose = require('mongoose');
const { Schema } = mongoose;

const flowPatternsSchema = new Schema({
    location_id: { type: String, ref: 'Location', required: true },
    pattern_type: { type: String, required: true },
    consequent_zones: { type: [String], ref: 'Zone' },
    antecedent_zones: { type: [String], ref: 'Zone' }, 
    confidence_score: { type: Number, default: 0 },
    support_score: { type: Number, default: 0 }, // số lân xuất hiện của pattern trong tổng số session
    lift_score: { type: Number, default: 0 }, // độ mạnh của pattern so với sự xuất hiện ngẫu nhiên
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now }
});

flowPatternsSchema.index({ location_id: 1 });
flowPatternsSchema.index({ consequent_zones: 1 });
flowPatternsSchema.index({ antecedent_zones: 1 });
flowPatternsSchema.index({ location_id: 1, create_at: 1 });

module.exports = mongoose.model('FlowPatterns', flowPatternsSchema);
