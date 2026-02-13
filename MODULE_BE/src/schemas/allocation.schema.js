const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Embedded Schema: Không sinh ra _id thừa
const ManagerInfoSchema = new Schema({
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true }
}, { _id: false });

const BusinessHoursSchema = new Schema({
    open: { type: String, required: true }, // Vd: "08:00"
    close: { type: String, required: true }, // Vd: "22:00"
    timezone: { type: String, default: "Asia/Ho_Chi_Minh" }
}, { _id: false });

const LocationSchema = new Schema({
    location_code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    address: { type: String },
    
    // ENUM định hướng logic hệ thống
    type_model: { 
        type: String, 
        enum: ['RETAIL', 'GYM', 'OFFICE'], 
        default: 'RETAIL' 
    },
    
    manager_info: ManagerInfoSchema,
    business_hours: BusinessHoursSchema,
    
    // Thuộc tính mở rộng dạng JSON tự do (Flexible)
    settings: { type: Schema.Types.Mixed, default: {} } 
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('Location', LocationSchema);