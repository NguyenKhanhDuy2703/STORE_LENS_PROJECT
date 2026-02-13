const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InteractionLogSchema = new Schema({
    session_id: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    zone_id: { type: Schema.Types.ObjectId, ref: 'Zone' },
    asset_id: { type: Schema.Types.ObjectId, ref: 'Asset' }, // Có thể null nếu chỉ đứng trong Zone
    
    event_type: { 
        type: String, 
        enum: ['ZONE_DWELL', 'FALL', 'PICK_UP', 'MACHINE_USE'], 
        required: true 
    },
    
    // -- NHÓM HEARTBEAT & THỜI GIAN --
    start_time: { type: Date, required: true },
    end_time: { type: Date },
    last_heartbeat: { type: Date, required: true }, // Phục vụ Worker dọn rác
    duration_seconds: { type: Number, default: 0 },
    
    // -- NHÓM TRẠNG THÁI --
    status: { 
        type: String, 
        enum: ['ACTIVE', 'COMPLETED'], 
        default: 'ACTIVE' 
    },
    interaction_class: { 
        type: String, 
        enum: ['PASS_THROUGH', 'GLANCE', 'ENGAGED', 'NONE'], 
        default: 'NONE' 
    }
}, { 
    // Không cần dùng timestamps tự động vì start_time/end_time mới là quan trọng
    versionKey: false 
});

// INDEX cực kỳ quan trọng cho Worker dọn rác (Tìm các log ACTIVE nhưng heartbeat đã cũ)
InteractionLogSchema.index({ status: 1, last_heartbeat: 1 });
// INDEX để update heartbeat nhanh (Tìm đúng log của session đang đứng ở zone đó)
InteractionLogSchema.index({ session_id: 1, zone_id: 1, status: 1 });

module.exports = mongoose.model('InteractionLog', InteractionLogSchema);