const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    
    session_uuid: { type: String, required: true, unique: true }, // ID duy nhất cho mỗi luồng đi
    person_id: { type: String }, // Track ID từ Camera trả về (Vd: "track_123")
    
    // Mảng Vector lưu đặc trưng khuôn mặt/dáng người (Phục vụ Re-ID)
    reid_vector: { type: [Number], default: [] }, 
    
    customer_type: { 
        type: String, 
        enum: ['VISITOR', 'MEMBER', 'STAFF', 'UNKNOWN'], 
        default: 'UNKNOWN' 
    },
    
    entry_time: { type: Date, required: true, default: Date.now },
    exit_time: { type: Date },
    total_dwell_time_seconds: { type: Number, default: 0 }

}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// Đánh Index để tìm kiếm những người đang ở trong cửa hàng nhanh nhất (chưa có exit_time)
SessionSchema.index({ location_id: 1, exit_time: 1 });

module.exports = mongoose.model('Session', SessionSchema);