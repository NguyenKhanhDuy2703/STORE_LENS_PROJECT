const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Embedded Array Item (Chi tiết hóa đơn / sản phẩm)
const EventDetailSchema = new Schema({
    item_id: { type: Schema.Types.ObjectId, ref: 'Asset' }, // Tham chiếu đến Asset nếu có
    item_name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unit_price: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 }
}, { _id: false });

const BusinessEventSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    event_code: { type: String, required: true, unique: true }, // Mã hóa đơn / Mã phiên tập
    
    // Phân loại mô hình kinh doanh
    type: { 
        type: String, 
        enum: ['PURCHASE', 'CHECK_IN', 'MEMBERSHIP_RENEW', 'ENTRY_ACCESS'], 
        required: true 
    },
    
    total_amount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    payment_method: { type: String, enum: ['CASH', 'CARD', 'TRANSFER', 'NONE'], default: 'NONE' },
    
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'CANCELLED'], default: 'COMPLETED' },
    
    // Danh sách mặt hàng hoặc gói tập
    event_details: [EventDetailSchema],
    
    date: { type: Date, default: Date.now }

}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('BusinessEvent', BusinessEventSchema);