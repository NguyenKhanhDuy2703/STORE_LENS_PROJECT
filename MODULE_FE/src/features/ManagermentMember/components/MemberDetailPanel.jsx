import { X, Loader } from "lucide-react";

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("vi-VN");
};

const formatTime = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const CATEGORY_ICON = { retention: "🔔", revenue: "⭐" };

export function MemberDetailPanel({ detail, loading, onClose }) {
    return (
        <>
            {/* Overlay để click ra ngoài đóng panel */}
            <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

            <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-slate-200 overflow-y-auto z-50">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900">Chi tiết hội viên</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Đóng"
                    >
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader size={24} className="text-teal-500 animate-spin" />
                    </div>
                ) : !detail ? null : (
                    <div className="p-6 space-y-6">
                        {/* Avatar + info */}
                        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                                {detail.name?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">{detail.name}</h3>
                                <p className="text-xs text-slate-400">{detail.code}</p>
                                <p className="text-sm text-teal-600 mt-0.5">{detail.phone}</p>
                            </div>
                        </div>

                        {/* Thống kê nhanh */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                                <p className="text-xs text-slate-400 mb-0.5">Tổng buổi</p>
                                <p className="text-lg font-bold text-slate-800 tabular-nums">{detail.totalSessions ?? 0}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                                <p className="text-xs text-slate-400 mb-0.5">Lần ghé cuối</p>
                                <p className="text-sm font-semibold text-slate-800">{formatDate(detail.lastVisit)}</p>
                            </div>
                        </div>

                        {/* Gợi ý chăm sóc từ rules của user */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-700 mb-2">Gợi ý chăm sóc</h4>
                            {detail.matchedRules && detail.matchedRules.length > 0 ? (
                                <div className="space-y-2">
                                    {detail.matchedRules.map((rule, i) => (
                                        <div key={i} className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-100 p-3">
                                            <span className="text-base shrink-0">{CATEGORY_ICON[rule.category] || "📌"}</span>
                                            <div>
                                                <p className="text-xs font-semibold text-amber-800">{rule.ruleName}</p>
                                                <p className="text-xs text-amber-700 mt-0.5">{rule.action}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl bg-teal-50 border border-teal-100 p-3">
                                    <p className="text-sm text-teal-700">✅ Hội viên đang ổn, không có cảnh báo nào.</p>
                                </div>
                            )}
                        </div>

                        {/* Lịch sử ghé thăm */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-700 mb-3">5 lần ghé gần nhất</h4>
                            {detail.recentVisits && detail.recentVisits.length > 0 ? (
                                <div className="space-y-2">
                                    {detail.recentVisits.map((visit, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="text-sm font-medium text-slate-700">{visit.date}</span>
                                            <span className="text-xs text-slate-400">
                                                {formatTime(visit.checkIn) || "—"}
                                                {visit.checkOut ? ` → ${formatTime(visit.checkOut)}` : " (đang tập)"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400">Chưa có lịch sử ghé thăm.</p>
                            )}
                        </div>

                        {/* Ghi chú */}
                        {detail.note && (
                            <div>
                                <h4 className="text-xs font-semibold text-slate-700 mb-1">Ghi chú</h4>
                                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">{detail.note}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
