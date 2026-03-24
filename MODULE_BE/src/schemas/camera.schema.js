const mongoose = require('mongoose');
const { Schema } = mongoose;

const cameraSpecSchema = new Schema({
    max_resolution: { type: Schema.Types.Mixed },
    current_resolution: { type: Schema.Types.Mixed }
}, { _id: false });

const cameraStateSchema = new Schema({
    last_processed_time: { type: Date },
    last_stop_time: { type: Date }
}, { _id: false });

const aiConfigSchema = new Schema({
    active_models: [Schema.Types.Mixed],
    processing_fps: { type: Number, default: 0 },
    confidence_threshold: { type: Number, default: 0 }
}, { _id: false });

const cameraSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    camera_name: { type: String, required: true, trim: true },
    camera_code: { type: String, required: true, unique: true, trim: true },
    rtsp_url: { type: String, required: true, trim: true },
    status: { type: String, trim: true },
    last_heartbeat: { type: Date },
    installation_date: { type: Date },
    camera_spec: cameraSpecSchema,
    camera_state: cameraStateSchema,
    ai_config: aiConfigSchema
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

cameraSchema.index({ location_id: 1 });
cameraSchema.index({ camera_code: 1 });
cameraSchema.index({ status: 1 });

module.exports = mongoose.model('Camera', cameraSchema);
