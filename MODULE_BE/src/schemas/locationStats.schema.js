const mongoose = require('mongoose');
const { Schema } = mongoose;

const kpisSchema = new Schema({
    total_visitors: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 },
    total_events: { type: Number, default: 0 },
    conversion_rate: { type: Number, default: 0 },
    avg_store_dwell_time: { type: Number, default: 0 },
    avg_basket_value: { type: Number, default: 0 }
}, { _id: false });

const realtimeSchema = new Schema({
    people_current: { type: Number, default: 0 },
    checkout_length: { type: Number, default: 0 }
}, { _id: false });

const chartDataSchema = new Schema({
    hour: { type: Number, required: true },
    people_count: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 }
}, { _id: false });

const topAssetSchema = new Schema({
    asset_id: { type: String, ref: 'Asset' },
    asset_name: { type: String, trim: true },
    total_quantity: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 },
    rank: { type: Number }
}, { _id: false });

const locationStatsSchema = new Schema({
    location_id: { type: String, ref: 'Location', required: true },
    date: { type: Date, required: true },
    kpis: kpisSchema,
    realtime: realtimeSchema,
    chart_data: [chartDataSchema],
    top_assets: [topAssetSchema]
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

locationStatsSchema.index({ location_id: 1 });
locationStatsSchema.index({ date: 1 });
locationStatsSchema.index({ location_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('LocationStats', locationStatsSchema);
