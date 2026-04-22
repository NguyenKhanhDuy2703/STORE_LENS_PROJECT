const mongoose = require('mongoose');
const { Schema } = mongoose;

const historySchema = new Schema({
    date: { type: Date, required: true },
    check_in: { type: Date },
    check_out: { type: Date },
    locationId: { type: String } // Lưu chi nhánh nơi khách tập buổi đó
}, { _id: false });

const customerSchema = new Schema({
    // --- QUẢN LÝ ---
    locationId: { type: String, required: true }, // Mã chi nhánh quản lý hội viên

    // --- ĐỊNH DANH ---
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },

    // --- THÔNG TIN CHIẾN LƯỢC ---
    birthday: { type: Date, required: true },
    joinDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },

    // --- CHỈ SỐ TÍCH LŨY ---
    totalSessions: { type: Number, default: 0 },
    lastVisit: { type: Date, default: null },

    // --- LỊCH SỬ TƯƠNG TÁC ---
    history: [historySchema], 

    // --- INSIGHT ---
    favoriteMuscleGroups: { type: [String], default: [] },
    note: { type: String }
}, { timestamps: true });

// Index để search theo chi nhánh + mã/sđt cho nhanh
customerSchema.index({ locationId: 1, code: 1 });
customerSchema.index({ locationId: 1, phone: 1 });
module.exports = mongoose.model('Customer', customerSchema);