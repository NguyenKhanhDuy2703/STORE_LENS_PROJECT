import { Camera, Wifi, WifiOff } from 'lucide-react';

const SummaryCard = ({ title, value, icon: Icon, iconClass }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-black/10">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold tracking-tight text-slate-500">{title}</p>
        <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">{value}</p>
      </div>
      <div className={`rounded-2xl p-3.5 ${iconClass}`}>
        <Icon size={22} />
      </div>
    </div>
  </div>
);

export const CameraSummaryCards = ({ cameras, metrics }) => {
  const total = metrics?.total ?? cameras.length;
  const active = metrics?.active ?? cameras.filter((cam) => cam.status === 'active' || cam.status === 'online').length;
  const error = metrics?.error ?? cameras.filter((cam) => cam.status === 'error' || cam.status === 'disconnect').length;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <SummaryCard title="Tổng camera" value={total} icon={Camera} iconClass="bg-indigo-100 text-indigo-600" />
      <SummaryCard title="Đang hoạt động" value={active} icon={Wifi} iconClass="bg-emerald-100 text-emerald-600" />
      <SummaryCard title="Cảnh báo" value={error} icon={WifiOff} iconClass="bg-rose-100 text-rose-600" />
    </div>
  );
};
