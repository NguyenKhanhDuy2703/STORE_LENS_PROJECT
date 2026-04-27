import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * StatCard — card thống kê dùng chung toàn app
 *
 * Variants:
 *   "simple"   — title + value + icon + trend text (dùng ở ManagermentMember)
 *   "trend"    — title + value + icon + % change badge (dùng ở AnalyticsArea, Downtime)
 *   "summary"  — title + value + icon gradient (dùng ở CameraSummaryCards)
 *
 * Props chung:
 *   title     : string
 *   value     : string | number
 *   icon      : ReactNode (simple/trend) | ComponentType (summary)
 *
 * Props theo variant:
 *   simple  : trend (string)
 *   trend   : change (number), subtitle (string)
 *   summary : gradient (string — tailwind class), shadowClass (string)
 */
const StatCard = ({
  variant = 'simple',
  title,
  value,
  icon,
  // simple
  trend,
  // trend variant
  change,
  subtitle,
  isUp,
  // summary variant
  gradient = 'bg-gradient-accent',
  shadowClass = 'shadow-sm',
}) => {

  // ── Simple variant ──────────────────────────────────────────────────────────
  if (variant === 'simple') {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-md border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-muted-foreground">{title}</div>
          <div className="text-accent">{icon}</div>
        </div>
        <div className="text-4xl font-semibold text-foreground tabular-nums tracking-tight mb-1">{value}</div>
        {trend && <div className="text-muted-foreground">{trend}</div>}
      </div>
    );
  }

  // ── Trend variant ───────────────────────────────────────────────────────────
  if (variant === 'trend') {
    const changeNum = Number(change ?? 0);
    const up = isUp ?? changeNum > 0;
    const neutral = changeNum === 0;

    const TrendIcon = neutral ? Minus : up ? TrendingUp : TrendingDown;
    const ArrowIcon = up ? ArrowUpRight : ArrowDownRight;
    const trendClass = neutral
      ? 'text-muted-foreground bg-muted border-border'
      : up
        ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
        : 'text-rose-600 bg-rose-50 border-rose-100';

    return (
      <div className="bg-card p-6 rounded-2xl border border-border shadow-md hover:shadow-lg transition-all duration-300 group">
        <div className="flex justify-between items-start mb-5">
          <div className="p-3 bg-accent/10 text-accent rounded-xl group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border font-medium ${trendClass}`}>
            <TrendIcon size={11} strokeWidth={3} />
            <span>{Math.abs(changeNum)}%</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-muted-foreground">{title}</p>
          <div className="text-4xl font-semibold text-foreground tabular-nums tracking-tight">{value}</div>
          {subtitle && <p className="text-muted-foreground pt-0.5">{subtitle}</p>}
        </div>
      </div>
    );
  }

  // ── Summary variant ─────────────────────────────────────────────────────────
  const Icon = icon;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{title}</p>
          <p className="mt-2.5 text-4xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${gradient} ${shadowClass} transition-all duration-300 group-hover:scale-110`}>
          {Icon && <Icon size={20} className="text-white" />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
