import { Pencil, Trash2 } from "lucide-react";

const STATUS_CONFIG = {
    active:        { label: "Đang tập",    bg: "bg-teal-50 text-teal-700 border-teal-200" },
    "absent-short":{ label: "Vắng ngắn",   bg: "bg-amber-50 text-amber-700 border-amber-200" },
    "absent-long": { label: "Vắng dài",    bg: "bg-rose-50 text-rose-700 border-rose-200" },
    inactive:      { label: "Không hoạt động", bg: "bg-muted text-muted-foreground border-border" },
    ACTIVE:        { label: "Hoạt động",   bg: "bg-teal-50 text-teal-700 border-teal-200" },
    INACTIVE:      { label: "Ngừng",       bg: "bg-muted text-muted-foreground border-border" },
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
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <p className="text-sm text-muted-foreground">Chưa có hội viên nào.</p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-border bg-muted">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hội viên</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Liên hệ</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Buổi tháng này</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lần ghé cuối</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ghi chú</th>
                            <th className="px-6 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {members.map((member) => {
                            const statusCfg = STATUS_CONFIG[member.status] || STATUS_CONFIG.inactive;
                            return (
                                <tr
                                    key={member.code}
                                    onClick={() => onSelectMember(member)}
                                    className={`cursor-pointer transition-colors ${
                                        selectedCode === member.code ? "bg-teal-50/60" : "hover:bg-muted"
                                    }`}
                                >
                                    {/* Hội viên */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                                {member.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground text-sm">{member.name}</div>
                                                <div className="text-xs text-muted-foreground">{member.code}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Liên hệ */}
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-foreground">{member.phone}</div>
                                        <div className="text-xs text-muted-foreground">{formatDate(member.birthday)}</div>
                                    </td>

                                    {/* Buổi tháng này */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-foreground tabular-nums">
                                            {member.sessionsThisMonth ?? 0}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-1">buổi</span>
                                    </td>

                                    {/* Lần ghé cuối */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted-foreground">{formatDate(member.lastVisit)}</span>
                                    </td>

                                    {/* Trạng thái */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg}`}>
                                            {statusCfg.label}
                                        </span>
                                    </td>

                                    {/* Ghi chú */}
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-muted-foreground">{member.note || "—"}</span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => onEdit(member)}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-teal-600 hover:bg-teal-50 transition-colors"
                                                title="Sửa"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(member.code)}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
