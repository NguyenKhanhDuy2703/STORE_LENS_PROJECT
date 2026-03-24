const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventDetailSchema = new Schema({
    item_id: { type: Schema.Types.ObjectId, ref: 'Asset' },
    item_name: { type: String, trim: true },
    quantity: { type: Number, default: 0 },
    unit_price: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 }
}, { _id: false });

const businessEventSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    event_code: { type: String, required: true, unique: true, trim: true },
    type: { type: String, trim: true },
    total_amount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    payment_method: { type: String, trim: true },
    status: { type: String, trim: true },
    date: { type: Date, required: true },
    event_details: [eventDetailSchema]
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

businessEventSchema.index({ location_id: 1 });
businessEventSchema.index({ event_code: 1 });
businessEventSchema.index({ date: 1 });

module.exports = mongoose.model('BusinessEvent', businessEventSchema);
