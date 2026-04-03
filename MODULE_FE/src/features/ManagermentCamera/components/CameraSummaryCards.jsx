import { Camera, Wifi, WifiOff } from 'lucide-react';

const SummaryCard = ({ title, value, icon: Icon, iconClass }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-medium tracking-tight text-slate-500">{title}</p>
        <p className="mt-2 text-4xl font-semibold text-slate-900">{value}</p>
      </div>
      <div className={`rounded-xl p-3 ${iconClass}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

export const CameraSummaryCards = ({ cameras }) => {
  const total = cameras.length;
  const active = cameras.filter((cam) => cam.status === 'online').length;
  const error = cameras.filter((cam) => cam.status === 'error').length;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <SummaryCard title="Tong Camera" value={total} icon={Camera} iconClass="bg-indigo-100 text-indigo-600" />
      <SummaryCard title="Luong Dang Hoat Dong" value={active} icon={Wifi} iconClass="bg-emerald-100 text-emerald-600" />
      <SummaryCard title="Gap Su Co" value={error} icon={WifiOff} iconClass="bg-rose-100 text-rose-600" />
    </div>
  );
};
