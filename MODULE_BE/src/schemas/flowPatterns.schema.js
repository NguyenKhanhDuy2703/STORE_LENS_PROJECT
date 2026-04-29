const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * flowPatternsSchema — lưu kết quả khai phá từ 2 thuật toán:
 *
 * [FP-Growth] pattern_type: "association_rule"
 *   - antecedent_zones : ["zone_A"]          ← zone đã ghé
 *   - consequent_zones : ["zone_B"]          ← zone thường ghé cùng
 *   - support_score, confidence_score, lift_score
 *   - sequence         : null (không dùng)
 *
 * [PrefixSpan] pattern_type: "frequent_sequence"
 *   - sequence         : ["zone_A","zone_B","zone_C"]  ← chuỗi di chuyển đầy đủ
 *   - support_score, support_count
 *   - antecedent_zones, consequent_zones, confidence_score, lift_score : null
 *
 * [PrefixSpan] pattern_type: "sequential_rule"
 *   - antecedent_zones : ["zone_A","zone_B"] ← đã đi qua (theo thứ tự)
 *   - consequent_zones : ["zone_C"]          ← sẽ đi tiếp
 *   - support_score, support_count, confidence_score
 *   - lift_score       : null (PrefixSpan không tính lift)
 *   - sequence         : null (không dùng)
 */
const flowPatternsSchema = new Schema({
    location_id:  { type: String, ref: 'Location', required: true },
    algorithm:    { type: String, enum: ['fpgrowth', 'prefixspan'], required: true },
    pattern_type: {
        type: String,
        enum: ['association_rule', 'frequent_sequence', 'sequential_rule'],
        required: true
    },

    // Dùng cho: association_rule, sequential_rule
    antecedent_zones: { type: [String], default: null },
    consequent_zones: { type: [String], default: null },

    // Dùng cho: frequent_sequence — chuỗi di chuyển đầy đủ theo thứ tự
    sequence: { type: [String], default: null },

    // Metrics chung
    support_score:    { type: Number, default: null }, // tỷ lệ [0,1]
    support_count:    { type: Number, default: null }, // số lần xuất hiện tuyệt đối
    confidence_score: { type: Number, default: null }, // null nếu không áp dụng
    lift_score:       { type: Number, default: null }, // null nếu không áp dụng

    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now }
});

// Index cho các query phổ biến
flowPatternsSchema.index({ location_id: 1 });
flowPatternsSchema.index({ location_id: 1, algorithm: 1 });
flowPatternsSchema.index({ location_id: 1, pattern_type: 1 });
flowPatternsSchema.index({ location_id: 1, algorithm: 1, create_at: -1 });

module.exports = mongoose.model('FlowPatterns', flowPatternsSchema);
