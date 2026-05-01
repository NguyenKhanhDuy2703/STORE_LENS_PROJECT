import { useState, useEffect } from "react";
import { X } from "lucide-react";

// Form thêm mới hoặc sửa hội viên (upsert theo code)
export function MemberForm({ editingMember, onSave, onClose, saving }) {
    const [form, setForm] = useState({
        code: "",
        name: "",
        phone: "",
        birthday: "",
        note: "",
        status: "ACTIVE"
    });

    // Pre-fill khi edit
    useEffect(() => {
        if (editingMember) {
            setForm({
                code: editingMember.code || "",
                name: editingMember.name || "",
                phone: editingMember.phone || "",
                birthday: editingMember.birthday
                    ? new Date(editingMember.birthday).toISOString().split("T")[0]
                    : "",
                note: editingMember.note || "",
                status: editingMember.status || "ACTIVE"
            });
        }
    }, [editingMember]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    const isEdit = Boolean(editingMember);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-base font-semibold text-slate-900">
                        {isEdit ? "Cập nhật hội viên" : "Thêm hội viên mới"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Code */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Mã hội viên <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                            disabled={isEdit}
                            placeholder="VD: KH001"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                            required
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Họ tên <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="Nguyễn Văn A"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Số điện thoại <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            placeholder="0901234567"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Birthday */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Ngày sinh <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={form.birthday}
                            onChange={(e) => handleChange("birthday", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Trạng thái</label>
                        <select
                            value={form.status}
                            onChange={(e) => handleChange("status", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
                        >
                            <option value="ACTIVE">Đang hoạt động</option>
                            <option value="INACTIVE">Ngừng hoạt động</option>
                        </select>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú</label>
                        <textarea
                            value={form.note}
                            onChange={(e) => handleChange("note", e.target.value)}
                            rows={2}
                            placeholder="Ghi chú thêm..."
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
