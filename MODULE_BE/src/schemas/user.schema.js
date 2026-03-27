const mongoose = require('mongoose');
const { Schema } = mongoose;
// Schema cho User
const userSchema = new Schema({
    account: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, trim: true  , Enum: ['ADMIN', 'USER', 'MANAGER'], default: 'USER' },
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: function(){return this.role !== 'ADMIN_SUPER';} }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

userSchema.index({ account: 1 });
userSchema.index({ email: 1 });
userSchema.index({ location_id: 1 });

module.exports = mongoose.model('User', userSchema);
