const mongoose = require('mongoose');
const { Schema } = mongoose;

const heatmapSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    camera_id: { type: Schema.Types.ObjectId, ref: 'Camera', required: true },
    date: { type: Date, required: true },
    time_stamp: { type: Number, required: true },
    width_matrix: { type: Number, required: true },
    height_matrix: { type: Number, required: true },
    grid_size: { type: Number, required: true },
    frame_width: { type: Number, required: true },
    frame_height: { type: Number, required: true },
    heatmap_matrix: [[Number]]
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

heatmapSchema.index({ location_id: 1 });
heatmapSchema.index({ camera_id: 1 });
heatmapSchema.index({ date: 1 });
heatmapSchema.index({ location_id: 1, camera_id: 1, date: -1 });

module.exports = mongoose.model('Heatmap', heatmapSchema);
