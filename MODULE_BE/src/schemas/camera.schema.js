const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CameraSpecSchema = new Schema({
    max_resolution: { type: String, default: "1920x1080" },
    current_resolution: { type: String, default: "1280x720" }
}, { _id: false });

const CameraStateSchema = new Schema({
    last_processed_time: { type: Date },
    last_stop_time: { type: Date }
}, { _id: false });

const AIConfigSchema = new Schema({
    active_models: [{ type: String, enum: ['pose', 'reid', 'face', 'detection'] }],
    processing_fps: { type: Number, default: 5 },
    confidence_threshold: { type: Number, default: 0.6 }
}, { _id: false });

const CameraSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    
    camera_name: { type: String, required: true },
    camera_code: { type: String, required: true, unique: true },
    rtsp_url: { type: String, required: true },
    
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'ERROR'], default: 'ACTIVE' },
    last_heartbeat: { type: Date },
    installation_date: { type: Date },
    
    // Các sub-document
    camera_spec: CameraSpecSchema,
    camera_state: CameraStateSchema,
    ai_config: { type: AIConfigSchema, default: () => ({ active_models: ['detection'] }) }

}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('Camera', CameraSchema);