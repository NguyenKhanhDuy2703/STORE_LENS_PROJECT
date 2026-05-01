import { Pencil, Trash2 } from "lucide-react";

const STATUS_CONFIG = {
    active:        { label: "Đang tập",    bg: "bg-teal-50 text-teal-700 border-teal-200" },
    "absent-short":{ label: "Vắng ngắn",   bg: "bg-amber-50 text-amber-700 border-amber-200" },
    "absent-long": { label: "Vắng dài",    bg: "bg-rose-50 text-rose-700 border-rose-200" },
    inactive:      { label: "Không hoạt động", bg: "bg-slate-100 text-slate-500 border-slate-200" },
    ACTIVE:        { label: "Hoạt động",   bg: "bg-teal-50 text-teal-700 border-teal-200" },
    INACTIVE:      { label: "Ngừng",       bg: "bg-slate-100 text-slate-500 border-slate-200" },
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("vi-VN");
};

export function MemberTable({ members, onSelectMember, onEdit, onDelete, selectedCode }) {
    if (!members || members.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-sm text-slate-500">Chưa có hội viên nào.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-slate-100 bg-slate-50">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hội viên</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Liên hệ</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Buổi tháng này</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lần ghé cuối</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ghi chú</th>
                            <th className="px-6 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {members.map((member) => {
                            const statusCfg = STATUS_CONFIG[member.status] || STATUS_CONFIG.inactive;
                            return (
                                <tr
                                    key={member.code}
                                    onClick={() => onSelectMember(member)}
                                    className={`cursor-pointer transition-colors ${
                                        selectedCode === member.code ? "bg-teal-50/60" : "hover:bg-slate-50"
                                    }`}
                                >
                                    {/* Hội viên */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                                {member.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900 text-sm">{member.name}</div>
                                                <div className="text-xs text-slate-400">{member.code}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Liên hệ */}
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-700">{member.phone}</div>
                                        <div className="text-xs text-slate-400">{formatDate(member.birthday)}</div>
                                    </td>

                                    {/* Buổi tháng này */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-slate-800 tabular-nums">
                                            {member.sessionsThisMonth ?? 0}
                                        </span>
                                        <span className="text-xs text-slate-400 ml-1">buổi</span>
                                    </td>

                                    {/* Lần ghé cuối */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600">{formatDate(member.lastVisit)}</span>
                                    </td>

                                    {/* Trạng thái */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg}`}>
                                            {statusCfg.label}
                                        </span>
                                    </td>

                                    {/* Ghi chú */}
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-slate-500">{member.note || "—"}</span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => onEdit(member)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                                                title="Sửa"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(member.code)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
