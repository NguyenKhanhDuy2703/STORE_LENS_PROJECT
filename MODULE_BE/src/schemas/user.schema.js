const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    account: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // Nhớ băm (hash) bằng bcrypt trước khi lưu
    email: { type: String, required: true, lowercase: true, trim: true },
    
    role: { type: String, enum: ['ADMIN', 'MANAGER', 'STAFF'], default: 'STAFF' },
    
    // Manager/Staff sẽ bị giới hạn chỉ xem được dữ liệu của location này
    location_id: { type: Schema.Types.ObjectId, ref: 'Location' }
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('User', UserSchema);