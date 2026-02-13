const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Embedded Array Item: TẮT _id ĐỂ TIẾT KIỆM 60% DUNG LƯỢNG
const PathDataSchema = new Schema({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    timestamp: { type: Number, required: true } // Dùng Unix Timestamp (Number) cho nhẹ thay vì Date object
}, { _id: false });

const TrajectoriesSchema = new Schema({
    session_id: { type: Schema.Types.ObjectId, ref: 'Session', required: true, unique: true },
    camera_id: { type: Schema.Types.ObjectId, ref: 'Camera', required: true },
    
    // Mảng chứa hàng ngàn điểm tọa độ
    path_data: [PathDataSchema]
}, { 
    timestamps: true 
});

// Index để load đường đi của 1 khách hàng cực nhanh
TrajectoriesSchema.index({ session_id: 1 });

module.exports = mongoose.model('Trajectory', TrajectoriesSchema);