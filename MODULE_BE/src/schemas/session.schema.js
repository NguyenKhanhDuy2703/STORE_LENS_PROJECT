const mongoose = require('mongoose');
const { Schema } = mongoose;

const sessionSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    session_uuid: { type: String, required: true, unique: true, trim: true },
    person_id: { type: String, trim: true },
    reid_vector: [Number],
    customer_type: { type: String, trim: true },
    entry_time: { type: Date, required: true },
    exit_time: { type: Date },
    total_dwell_time_seconds: { type: Number, default: 0 }
});

sessionSchema.index({ location_id: 1 });
sessionSchema.index({ session_uuid: 1 });
sessionSchema.index({ person_id: 1 });
sessionSchema.index({ entry_time: 1 });

module.exports = mongoose.model('Session', sessionSchema);
