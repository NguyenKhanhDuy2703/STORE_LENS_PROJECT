const mongoose = require('mongoose');
const { Schema } = mongoose;
// Thông tin người quản lý
const managerInfoSchema = new Schema({
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true }
}, { _id: false });
 // Thông tin giờ mở cửa
const businessHoursSchema = new Schema({
    open: { type: String, required: true },
    close: { type: String, required: true },
    timezone: { type: String, default: 'Asia/Ho_Chi_Minh' }
}, { _id: false });
// Schema chính cho Location
const locationSchema = new Schema({
    location_code: { type: String, required: true, unique: true, uppercase: true, trim: true }, 
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    type_model: { type: String, enum: ['RETAIL', 'GYM', 'OFFICE'], default: 'RETAIL' },
    manager_info: managerInfoSchema,
    business_hours: businessHoursSchema
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

locationSchema.index({ location_code: 1 });
locationSchema.index({ type_model: 1 });

module.exports = mongoose.model('Location', locationSchema);
