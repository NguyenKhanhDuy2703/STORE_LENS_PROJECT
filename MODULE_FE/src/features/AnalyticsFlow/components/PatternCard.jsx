import { ArrowRight } from "lucide-react";

const PATTERN_CONFIG = {
    association_rule: {
        label: "Hay đi cùng nhau",
        tagline: "Những khu vực này thường được khách ghé trong cùng một chuyến mua sắm.",
        antecedentTitle: null,
        consequentTitle: null,
        badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
        accentBar: "bg-teal-500",
        metricBar: "bg-teal-500",
        numberColor: "text-teal-600",
    },
    frequent_sequence: {
        label: "Lộ trình hay đi",
        tagline: "Đây là hành trình di chuyển phổ biến nhất của khách trong cửa hàng.",
        antecedentTitle: null,
        consequentTitle: null,
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
        accentBar: "bg-blue-500",
        metricBar: "bg-blue-500",
        numberColor: "text-blue-600",
    },
    sequential_rule: {
        label: "Điểm đến tiếp theo",
        tagline: "Sau khi ghé khu vực bên trái, khách thường tiếp tục đi đến khu vực bên phải.",
        antecedentTitle: "Sau khi ghé",
        consequentTitle: "Khách thường đi đến",
        badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
        accentBar: "bg-purple-500",
        metricBar: "bg-purple-500",
        numberColor: "text-purple-600",
    },
};

const confidenceText = (score) => {
    if (score === null || score === undefined) return null;
    const pct = Math.round(score * 100);
    if (pct >= 90) return { text: `${pct} trong 100 khách đi theo`, note: "Gần như chắc chắn" };
    if (pct >= 70) return { text: `${pct} trong 100 khách đi theo`, note: "Khá chắc chắn" };
    if (pct >= 50) return { text: `${pct} trong 100 khách đi theo`, note: "Có xu hướng" };
    return { text: `${pct} trong 100 khách đi theo`, note: "Một phần" };
};

const ZoneTag = ({ name }) => (
    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 whitespace-nowrap">
        {String(name).replace(/_/g, " ")}
    </span>
);

const ZoneFlow = ({ zones }) => (
    <div className="flex flex-wrap items-center gap-2">
        {zones.map((name, i) => (
            <span key={i} className="flex items-center gap-2">
                <ZoneTag name={name} />
                {i < zones.length - 1 && (
                    <ArrowRight size={14} className="text-slate-400 shrink-0" />
                )}
            </span>
        ))}
    </div>
);

const PatternCard = ({ pattern }) => {
    const {
        pattern_type,
        antecedent_zones,
        consequent_zones,
        sequence,
        support_score,
        support_count,
        confidence_score,
        lift_score,
    } = pattern;

    const cfg = PATTERN_CONFIG[pattern_type] || PATTERN_CONFIG.association_rule;
    const supportPct = support_score !== null && support_score !== undefined
        ? Math.round(support_score * 100)
        : null;
    const confData = confidenceText(confidence_score);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
            {/* Accent bar trên cùng — màu theo loại */}
            <div className={`h-1 w-full ${cfg.accentBar}`} />

            {/* Header */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${cfg.badgeBg}`}>
                    {cfg.label}
                </span>
                {support_count && (
                    <span className="text-xs text-muted-foreground shrink-0">
                        {support_count} lượt ghi nhận
                    </span>
                )}
            </div>

            {/* Tagline */}
            <p className="px-5 text-sm text-muted-foreground leading-relaxed pb-4">
                {cfg.tagline}
            </p>

            {/* Zones content */}
            <div className="px-5 pb-5 space-y-4">
                {pattern_type === "association_rule" && antecedent_zones && consequent_zones && (
                    <ZoneFlow zones={[...antecedent_zones, ...consequent_zones]} />
                )}

                {pattern_type === "frequent_sequence" && sequence && (
                    <ZoneFlow zones={sequence} />
                )}

                {pattern_type === "sequential_rule" && antecedent_zones && consequent_zones && (
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                {cfg.antecedentTitle}
                            </p>
                            <ZoneFlow zones={antecedent_zones} />
                        </div>
                        {/* Divider với mũi tên */}
                        <div className="flex items-center gap-3 py-1">
                            <div className="h-px flex-1 bg-slate-100" />
                            <span className="text-xs font-medium text-slate-400">rồi tiếp đến</span>
                            <div className="h-px flex-1 bg-slate-100" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                {cfg.consequentTitle}
                            </p>
                            <ZoneFlow zones={consequent_zones} />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer metrics */}
            <div className="mt-auto border-t border-slate-100 bg-slate-50/60 px-5 py-4 space-y-3">
                {/* Confidence */}
                {confData && (
                    <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm text-slate-600">{confData.note}</p>
                        <p className={`text-sm font-bold shrink-0 ${cfg.numberColor}`}>
                            {confData.text}
                        </p>
                    </div>
                )}

                {/* Support bar */}
                {supportPct !== null && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Mức phổ biến</span>
                            <span className={`text-sm font-bold ${cfg.numberColor}`}>{supportPct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${cfg.metricBar}`}
                                style={{ width: `${Math.min(supportPct, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Khoảng {supportPct}% khách hàng đi theo xu hướng này
                        </p>
                    </div>
                )}

                {/* Lift — chỉ hiện nếu có */}
                {lift_score !== null && lift_score !== undefined && (
                    <p className="text-xs text-muted-foreground">
                        Xu hướng này xảy ra nhiều hơn{" "}
                        <span className={`font-semibold ${cfg.numberColor}`}>{lift_score.toFixed(1)} lần</span>{" "}
                        so với khách di chuyển ngẫu nhiên.
                    </p>
                )}
            </div>
        </div>
    );
};

export default PatternCard;
