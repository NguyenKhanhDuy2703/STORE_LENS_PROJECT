const mongoose = require('mongoose');
const { Schema } = mongoose;

const zoneSchema = new Schema({
    location_id: { type: String, ref: 'Location', required: true },
    camera_id: { type: String, ref: 'Camera', required: true },
    zone_name: { type: String, required: true, trim: true },
    zone_id: { type: String, required: true, uppercase: true, trim: true },
    category_name: { type: String, ref: 'Asset' },// loại chức năng của zone (category_name)
    polygon_coordinates: { type: [[Number]], required: true },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

zoneSchema.statics.getListZoneByCameraCode = async function ({ locationId, cameraCode }) {
    const zones = await this.find(
        { location_id: locationId, camera_id: cameraCode },
        { zone_id: 1, polygon_coordinates: 1, _id: 0 }
    ).lean();

    return zones.map((zone) => ({
        zone_id: zone.zone_id,
        points: Array.isArray(zone.polygon_coordinates) ? zone.polygon_coordinates : [],
    }));
};


module.exports = mongoose.model('Zone', zoneSchema);
