const mongoose = require('mongoose');
const { Schema } = mongoose;
// Thông tin thuộc tính đặc biệt của tài sản
const assetAttributesSchema = new Schema({
    maintenance_date: { type: String, trim: true },
    color: { type: String, trim: true },
    custom_note: { type: String, trim: true }
}, { _id: false });
// Schema chính cho Asset
const assetSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    category_name: { type: String, required: true, trim: true },
    name_product: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    price: { type: Number, default: 0 },
    unit: { type: String, trim: true },
    stock_quantity: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    asset_attributes: assetAttributesSchema
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

assetSchema.index({ location_id: 1 });
assetSchema.index({ category_name: 1 });
assetSchema.index({ name_product: 1 });

module.exports = mongoose.model('Asset', assetSchema);
