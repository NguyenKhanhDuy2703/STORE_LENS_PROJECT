const customerCareRuleSchema = new Schema({
    location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    // Phân loại lớn (Retention/Zone/Revenue) 
    category: { type: String, enum: ['retention', 'zone', 'revenue'], required: true },
    rule_name: { type: String, required: true }, 
    // Bộ logic chi tiết
    logic: {
        metric_name: { type: String, required: true }, // VD: 'peak_count', 'daily_total'
        operator: { type: String, enum: ['>', '<', '>=', '<='], required: true },
        threshold: { type: Number, required: true },
        unit: { type: String } // 'ngày', 'phút', 'vnđ'
    },
    action: {
        type_action: { type: String, required: true }, 
        message_template: String
    },
    is_active: { type: Boolean, default: true }
}, { timestamps: true });
customerCareRuleSchema.index({ location_id: 1, category: 1, is_active: 1 });