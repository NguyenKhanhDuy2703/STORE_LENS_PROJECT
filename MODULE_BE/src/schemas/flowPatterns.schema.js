const mongoose = require('mongoose');
const { Schema } = mongoose;

const flowPatternsSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    date_range: { type: String, required: true, trim: true },
    source_zone_id: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
    target_zone_id: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
    probability: { type: Number, default: 0 }
});

flowPatternsSchema.index({ location_id: 1 });
flowPatternsSchema.index({ source_zone_id: 1 });
flowPatternsSchema.index({ target_zone_id: 1 });
flowPatternsSchema.index({ location_id: 1, date_range: 1 });

module.exports = mongoose.model('FlowPatterns', flowPatternsSchema);
