const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatMessageSchema = new Schema({
    role: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const chatSessionSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    title: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    chat_messages: [chatMessageSchema]
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

chatSessionSchema.index({ user_id: 1 });
chatSessionSchema.index({ location_id: 1 });
chatSessionSchema.index({ created_at: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
