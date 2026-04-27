import { Camera, Wifi, WifiOff } from 'lucide-react';

const SummaryCard = ({ title, value, icon: Icon, gradient, shadowClass }) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
    <div className="flex items-start justify-between">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{title}</p>
        <p className="mt-2.5 text-4xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
      </div>
      <div className={`rounded-xl p-3 ${gradient} ${shadowClass} transition-all duration-300 group-hover:scale-110`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

export const CameraSummaryCards = ({ cameras, metrics }) => {
  const total  = metrics?.total  ?? cameras.length;
  const active = metrics?.active ?? cameras.filter((c) => c.status === 'active' || c.status === 'online').length;
  const error  = metrics?.error  ?? cameras.filter((c) => c.status === 'error'  || c.status === 'disconnect').length;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <SummaryCard title="Tổng camera"      value={total}  icon={Camera}  gradient="bg-gradient-accent"   shadowClass="shadow-accent" />
      <SummaryCard title="Đang hoạt động"   value={active} icon={Wifi}    gradient="bg-gradient-to-br from-emerald-500 to-emerald-400" shadowClass="shadow-sm" />
      <SummaryCard title="Cảnh báo"         value={error}  icon={WifiOff} gradient="bg-gradient-to-br from-rose-500 to-rose-400"      shadowClass="shadow-sm" />
    </div>
  );
};
