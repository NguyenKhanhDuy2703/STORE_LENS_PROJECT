const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HeatmapSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    camera_id: { type: Schema.Types.ObjectId, ref: 'Camera', required: true },
    
    date: { type: Date, required: true },
    time_stamp: { type: Number, required: true }, // Unix timestamp của bản ghi
    
    width_matrix: { type: Number, required: true },
    height_matrix: { type: Number, required: true },
    grid_size: { type: Number, required: true },
    frame_width: { type: Number, required: true },
    frame_height: { type: Number, required: true },
    
    // Ma trận 2D lưu giá trị độ nóng
    heatmap_matrix: { type: [[Number]], required: true }

}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('Heatmap', HeatmapSchema);