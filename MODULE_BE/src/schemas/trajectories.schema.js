const mongoose = require('mongoose');
const { Schema } = mongoose;

const pathDataSchema = new Schema({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    timestamp: { type: Number, required: true }
}, { _id: false });

const trajectoriesSchema = new Schema({
    session_id: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    camera_id: { type: Schema.Types.ObjectId, ref: 'Camera', required: true },
    path_data: [pathDataSchema]
});

trajectoriesSchema.index({ session_id: 1 });
trajectoriesSchema.index({ camera_id: 1 });

module.exports = mongoose.model('Trajectory', trajectoriesSchema);
