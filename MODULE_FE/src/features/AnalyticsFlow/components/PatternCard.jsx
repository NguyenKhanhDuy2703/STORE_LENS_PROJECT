import { ArrowRight, Users } from "lucide-react";

// Badge config theo pattern_type
const BADGE_CONFIG = {
    association_rule: {
        label: "Khu vực liên quan",
        bg: "bg-teal-50 text-teal-700 border-teal-200",
        dot: "bg-teal-500",
    },
    frequent_sequence: {
        label: "Lộ trình phổ biến",
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
    },
    sequential_rule: {
        label: "Xu hướng tiếp theo",
        bg: "bg-purple-50 text-purple-700 border-purple-200",
        dot: "bg-purple-500",
    },
};

// Chuyển confidence_score → mô tả tự nhiên
const confidenceLabel = (score) => {
    if (score === null || score === undefined) return null;
    if (score >= 1.0) return "Toàn bộ khách đều đi theo xu hướng này";
    if (score >= 0.8) return "Hầu hết khách đi theo xu hướng này";
    if (score >= 0.6) return "Phần lớn khách đi theo xu hướng này";
    if (score >= 0.4) return "Khoảng một nửa khách đi theo xu hướng này";
    return "Một phần khách đi theo xu hướng này";
};

// Chuyển support_score → % hiển thị
const supportPercent = (score) =>
    score !== null && score !== undefined ? Math.round(score * 100) : null;

const ZoneFlow = ({ zones }) => (
    <div className="flex flex-wrap items-center gap-1.5">
        {zones.map((name, i) => (
            <span key={i} className="flex items-center gap-1.5">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {String(name).replace(/_/g, " ")}
                </span>
                {i < zones.length - 1 && (
                    <ArrowRight size={13} className="text-slate-400 shrink-0" />
                )}
            </span>
        ))}
    </div>
);

const PatternCard = ({ pattern }) => {
    const { pattern_type, antecedent_zones, consequent_zones, sequence,
            support_score, support_count, confidence_score } = pattern;

    const badge = BADGE_CONFIG[pattern_type] || BADGE_CONFIG.association_rule;
    const pct = supportPercent(support_score);
    const confLabel = confidenceLabel(confidence_score);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
            {/* Badge */}
            <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                </span>
                {support_count && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Users size={12} />
                        {support_count} khách
                    </span>
                )}
            </div>

            {/* Pattern content */}
            <div className="space-y-2">
                {pattern_type === "association_rule" && antecedent_zones && consequent_zones && (
                    <div className="space-y-2">
                        <ZoneFlow zones={[...antecedent_zones, ...consequent_zones]} />
                        <p className="text-xs text-slate-500">Khách ghé các khu này trong cùng một chuyến</p>
                    </div>
                )}

                {pattern_type === "frequent_sequence" && sequence && (
                    <div className="space-y-2">
                        <ZoneFlow zones={sequence} />
                        <p className="text-xs text-slate-500">Lộ trình này được nhiều khách đi theo</p>
                    </div>
                )}

                {pattern_type === "sequential_rule" && antecedent_zones && consequent_zones && (
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Sau khi ghé</p>
                            <ZoneFlow zones={antecedent_zones} />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Khách thường đi tiếp đến</p>
                            <ZoneFlow zones={consequent_zones} />
                        </div>
                    </div>
                )}
            </div>

            {/* Metrics */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
                {confLabel && (
                    <p className="text-xs text-slate-600 font-medium">{confLabel}</p>
                )}
                {pct !== null && (
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400">Mức độ phổ biến</span>
                            <span className="text-[10px] font-semibold text-slate-600">{pct}% khách</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-teal-500 transition-all duration-700"
                                style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatternCard;
