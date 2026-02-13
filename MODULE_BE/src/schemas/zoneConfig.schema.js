const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Cấu hình thời gian để phân loại hành vi
const ThresholdSchema = new Schema({
    min_duration_sec: { type: Number, default: 5 },    
    engaged_duration_sec: { type: Number, default: 60 } 
}, { _id: false });

const ZoneConfigSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    camera_id: { type: Schema.Types.ObjectId, ref: 'Camera', required: true },
    
    zone_name: { type: String, required: true },
    function_type: { 
        type: String, 
        enum: ['ENTRANCE', 'PAYMENT', 'SHELF', 'CARDIO_AREA', 'WEIGHT_AREA', 'OTHER'],
        default: 'OTHER'
    },
    thresholds: { type: ThresholdSchema, default: () => ({}) },
    polygon_coordinates: { type: [[Number]], required: true, default: [] }

}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

ZoneConfigSchema.index({ camera_id: 1 });

module.exports = mongoose.model('Zone', ZoneConfigSchema);