const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
    location_id: { 
        type: String, 
        ref: 'Location', 
        required: true 
    },
    rule_id: { 
        type: String, 
        ref: 'CustomerCareRule', 
        default: null 
    },
    session_id: { 
        type: String, 
        ref: 'Session', 
        default: null 
    },
    type: { 
        type: String, 
        required: true, 
        trim: true,
        uppercase: true 
    },
    title: { 
        type: String, 
        required: true, 
        enum: ['NORMAL', 'ALERT'],
        trim: true 
    },
    message: { 
        type: String, 
        required: true, 
        trim: true 
    },
    is_read: { 
        type: Boolean, 
        default: false 
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

notificationSchema.index({ location_id: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ is_read: 1 });
notificationSchema.index({ created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);