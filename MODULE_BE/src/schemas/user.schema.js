const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    account: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // Nhớ băm (hash) bằng bcrypt trước khi lưu
    email: { type: String, required: true, lowercase: true, trim: true },
<<<<<<< HEAD
    
    role: { type: String, enum: ['ADMIN', 'MANAGER', 'STAFF'], default: 'STAFF' },
    
    // Manager/Staff sẽ bị giới hạn chỉ xem được dữ liệu của location này
    location_id: { type: Schema.Types.ObjectId, ref: 'Location' }
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
=======
    role: { type: String, trim: true  , enum: ['ADMIN', 'USER', 'MANAGER'], default: 'USER' },
    location_id: { type: String, ref: 'Location', required: function(){return this.role !== 'ADMIN_SUPER';} }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
>>>>>>> d9e048f ([MODULE_BE] feat : add testcase auth (login , logout , register ) , fix : auth.controller (use trim() remove space ))
});

module.exports = mongoose.model('User', UserSchema);