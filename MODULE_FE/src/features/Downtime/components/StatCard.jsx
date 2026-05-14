import { Clock, Zap, BarChart3 } from 'lucide-react';

/**
 * StatCard — khớp với MetricCard pattern của Dashboard:
 * - Accent bar trên cùng (màu theo loại)
 * - Icon nằm góc phải với nền màu
 * - Số liệu to, rõ
 * - Hover: shadow + dịch lên nhẹ
 */
const StatCard = ({ title, value, subtitle, icon, iconBg, iconColor, accent }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden relative">
      {/* Accent bar trên cùng */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />

      {/* Top row: label + icon */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>

      {/* Value */}
      <div>
        <h2 className="text-3xl font-bold text-foreground tabular-nums tracking-tight leading-none">
          {value}
        </h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;