import React from 'react';
import { Users, UserCheck, Shield } from 'lucide-react';

export const CustomerStats = ({ stats }) => {
  const items = [
    { label: 'Tổng tài khoản', value: stats.totalUsers, icon: Users, color: 'text-slate-600', bg: 'bg-slate-50' },
    { label: 'Tài khoản hoạt động', value: stats.activeUsers, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Admin/Manager', value: stats.adminUsers + stats.managerUsers, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      {items.map((item, i) => (
        <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-medium text-slate-500 tracking-tight">{item.label}</p>
            <h3 className="text-3xl font-semibold text-slate-900 mt-1 tabular-nums">{item.value}</h3>
          </div>
          <div className={`p-3 rounded-lg ${item.bg} ${item.color}`}><item.icon size={22} /></div>
        </div>
      ))}
    </div>
  );
};