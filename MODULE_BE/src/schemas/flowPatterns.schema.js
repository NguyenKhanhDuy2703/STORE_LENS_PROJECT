const mongoose = require('mongoose');
const { Schema } = mongoose;

const flowPatternsSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    pattern_type: { type: String, required: true },
    consequent_zones: {type: [Schema.Types.ObjectId], ref: 'Zone' },  
    antecedent_zones: {type: [Schema.Types.ObjectId], ref: 'Zone' }, 
    confidence_score: { type: Number, default: 0 },
    support_score: { type: Number, default: 0 }, // số lân xuất hiện của pattern trong tổng số session
    lift_score: { type: Number, default: 0 }, // độ mạnh của pattern so với sự xuất hiện ngẫu nhiên
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now }
});

flowPatternsSchema.index({ location_id: 1 });
flowPatternsSchema.index({ source_zone_id: 1 });
flowPatternsSchema.index({ target_zone_id: 1 });
flowPatternsSchema.index({ location_id: 1, date_range: 1 });

module.exports = mongoose.model('FlowPatterns', flowPatternsSchema);
