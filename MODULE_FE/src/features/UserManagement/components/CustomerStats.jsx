import React from 'react';
import { Users, TrendingUp, Clock } from 'lucide-react';

export const CustomerStats = ({ stats }) => {
  const items = [
    { label: 'Tổng thành viên', value: stats.totalMembers.toLocaleString(), growth: stats.totalMembersGrowth, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tỷ lệ quay lại', value: `${stats.returnRate}%`, growth: stats.returnRateGrowth, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Thời gian dừng TB', value: `${stats.avgDwellMinutes}m`, growth: stats.avgDwellGrowthMinutes, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      {items.map((item, i) => (
        <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">{item.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{item.value}</h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">↑ {item.growth}% so với tháng trước</p>
          </div>
          <div className={`p-3 rounded-lg ${item.bg} ${item.color}`}><item.icon size={22} /></div>
        </div>
      ))}
    </div>
  );
};