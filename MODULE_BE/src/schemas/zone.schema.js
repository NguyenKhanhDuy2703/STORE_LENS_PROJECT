const mongoose = require('mongoose');
const { Schema } = mongoose;

const zoneSchema = new Schema({
    location_id: { type: String, ref: 'Location', required: true },
    camera_id: { type: String, ref: 'Camera', required: true },
    zone_name: { type: String, required: true, trim: true },
    zone_id: { type: String, required: true, uppercase: true, trim: true },
    function_type: { type: String, trim: true }, // loại chức năng của zone (category_name)
    polygon_coordinates: { type: [[Number]], required: true },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

zoneSchema.index({ location_id: 1 });
zoneSchema.index({ camera_id: 1 });
zoneSchema.index({ location_id: 1, camera_id: 1 });

module.exports = mongoose.model('Zone', zoneSchema);
