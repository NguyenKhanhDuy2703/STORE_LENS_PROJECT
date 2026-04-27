export default function StatsCard({ title, value, icon, trend }) {
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
