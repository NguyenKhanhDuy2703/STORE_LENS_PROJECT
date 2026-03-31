import React from 'react';
import { Camera, Wifi, WifiOff } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

export const CameraStats = ({ cameras }) => {
  const active = cameras.filter(c => c.status === 'active').length;
  const issues = cameras.filter(c => c.status === 'issue').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard label="Tổng Camera" value={cameras.length} icon={Camera} colorClass="bg-indigo-50 text-indigo-600" />
      <StatCard label="Đang chạy" value={active} icon={Wifi} colorClass="bg-emerald-50 text-emerald-600" />
      <StatCard label="Gặp sự cố" value={issues} icon={WifiOff} colorClass="bg-rose-50 text-rose-600" />
    </div>
  );
};