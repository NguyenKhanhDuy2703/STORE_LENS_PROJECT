const mongoose = require('mongoose');
const { Schema } = mongoose;
// Session schema to track individual sessions at a location
const sessionSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    session_uuid: { type: String, required: true, unique: true, trim: true },
    person_id: { type: String, trim: true },
    reid_vector: [Number],
    entry_time: { type: Date, required: true }, // thời gian vào location
    exit_time: { type: Date }, // thời gian rời location
    total_dwell_time_seconds: { type: Number, default: 0 },
    zone_sequence:[
        {
            zone_id: { type: Schema.Types.ObjectId, ref: 'Zone' },
            entry_time: { type: Date }, // thời gian vao zone
            exit_time: { type: Date },// thơi gian rời zone
            dwell_time_seconds: { type: Number, default: 0 }
        }
    ]
});

sessionSchema.index({ location_id: 1 });
sessionSchema.index({ session_uuid: 1 });
sessionSchema.index({ person_id: 1 });
sessionSchema.index({ entry_time: 1 });

module.exports = mongoose.model('Session', sessionSchema);
