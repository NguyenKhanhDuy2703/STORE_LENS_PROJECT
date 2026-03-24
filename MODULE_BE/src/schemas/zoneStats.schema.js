const mongoose = require('mongoose');
const { Schema } = mongoose;

const performanceSchema = new Schema({
    people_count: { type: Number, default: 0 },
    total_sales_value: { type: Number, default: 0 },
    total_events: { type: Number, default: 0 },
    conversion_rate: { type: Number, default: 0 },
    avg_dwell_time: { type: Number, default: 0 },
    total_stop_events: { type: Number, default: 0 },
    top_asset_id: { type: Schema.Types.ObjectId, ref: 'Asset' },
    peak_hour: { type: Number }
}, { _id: false });

const zoneStatsSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    zone_id: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
    date: { type: Date, required: true },
    trend: { type: String, trim: true },
    performance: performanceSchema
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

zoneStatsSchema.index({ zone_id: 1, date: 1 }, { unique: true });
zoneStatsSchema.index({ location_id: 1, date: 1 });

module.exports = mongoose.model('ZoneStats', zoneStatsSchema);
