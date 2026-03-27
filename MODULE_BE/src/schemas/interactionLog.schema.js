const mongoose = require('mongoose');
const { Schema } = mongoose;
// bản lưu chi tiếc các tương tác của session với zone, asset
const interactionLogSchema = new Schema({
    session_id: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    zone_id: { type: Schema.Types.ObjectId, ref: 'Zone' },
    asset_id: { type: Schema.Types.ObjectId, ref: 'Asset' },
    event_type: { type: String, required: true, trim: true },
    start_time: { type: Date, required: true },
    last_heartbeat: { type: Date, required: true },
    duration_seconds: { type: Number, default: 0 },
    status: { type: String, trim: true },
});

interactionLogSchema.index({ session_id: 1 });
interactionLogSchema.index({ location_id: 1 });
interactionLogSchema.index({ zone_id: 1 });
interactionLogSchema.index({ asset_id: 1 });

module.exports = mongoose.model('InteractionLog', interactionLogSchema);
