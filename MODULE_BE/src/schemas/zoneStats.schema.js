const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// -- CÁC SUB-SCHEMA KHÔNG CẦN _ID --

const PerformanceSchema = new Schema({
    performance_people_count: { type: Number, default: 0 }, // Số lượt khách ghé thăm zone
    total_sales_value: { type: Number, default: 0 }, // Doanh thu phát sinh tại zone này (nếu là bán lẻ)
    total_events: { type: Number, default: 0 },
    conversion_rate: { type: Number, default: 0 },
    avg_dwell_time: { type: Number, default: 0 }, // Trung bình khách đứng ở zone này bao lâu (giây)
    total_stop_events: { type: Number, default: 0 }, // Số lượng sự kiện AI ghi nhận (ví dụ: Ngã, Lấy đồ)
    top_asset_id: { type: Schema.Types.ObjectId, ref: 'Asset' }, // Sản phẩm/Máy tập hot nhất ở zone này
    peak_hour: { type: Number, default: 0 } // Giờ cao điểm (0-23)
}, { _id: false });

// -- SCHEMA CHÍNH --

const ZoneStatSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    zone_id: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
    
    date: { type: Date, required: true },
    
    performance: { type: PerformanceSchema, default: () => ({}) },
    
    // Xu hướng so với ngày hôm qua
    trend: { 
        type: String, 
        enum: ['UP', 'DOWN', 'STEADY'], 
        default: 'STEADY' 
    }

}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// INDEX: Tìm báo cáo của một zone cụ thể trong một ngày
ZoneStatSchema.index({ zone_id: 1, date: 1 }, { unique: true });
// INDEX: Tìm toàn bộ báo cáo các zone của một cửa hàng trong một ngày
ZoneStatSchema.index({ location_id: 1, date: 1 });

module.exports = mongoose.model('ZoneStat', ZoneStatSchema);