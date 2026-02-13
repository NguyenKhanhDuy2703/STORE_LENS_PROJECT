const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// -- CÁC SUB-SCHEMA KHÔNG CẦN _ID --

const KPISchema = new Schema({
    total_visitors: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 },
    total_events: { type: Number, default: 0 }, // Tổng số event (Mua hàng/Check-in)
    conversion_rate: { type: Number, default: 0 }, // Tỉ lệ chuyển đổi (%)
    avg_store_dwell_time: { type: Number, default: 0 }, // Tính bằng giây
    avg_basket_value: { type: Number, default: 0 } // Giá trị giỏ hàng trung bình
}, { _id: false });

const RealtimeSchema = new Schema({
    people_current: { type: Number, default: 0 },
    checkout_length: { type: Number, default: 0 } // Số người đang đợi ở quầy
}, { _id: false });

const ChartDataSchema = new Schema({
    hour: { type: Number, required: true }, // Từ 0 đến 23
    people_count: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 }
}, { _id: false });

const TopAssetSchema = new Schema({
    asset_id: { type: Schema.Types.ObjectId, ref: 'Asset' },
    asset_name: { type: String },
    total_quantity: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 },
    rank: { type: Number, required: true }
}, { _id: false });

// -- SCHEMA CHÍNH --

const LocationStatSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    date: { type: Date, required: true }, // Lưu ngày (ví dụ: 2023-10-25 00:00:00)
    
    kpis: { type: KPISchema, default: () => ({}) },
    realtime: { type: RealtimeSchema, default: () => ({}) },
    chart_data: [ChartDataSchema],
    top_assets: [TopAssetSchema]

}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// INDEX: Tìm báo cáo của một cửa hàng theo ngày cực nhanh
// unique: true đảm bảo mỗi ngày 1 store chỉ có 1 bản ghi báo cáo duy nhất
LocationStatSchema.index({ location_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('LocationStat', LocationStatSchema);