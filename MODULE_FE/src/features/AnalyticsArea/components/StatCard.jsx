import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, trend, isUp, icon, bgColor }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${bgColor}`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium tracking-tight ${isUp ? 'text-teal-600' : 'text-rose-600'}`}>
        {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {trend}
      </div>
    </div>
    <div className="mt-4">
      <p className="text-slate-400 text-xs font-medium tracking-tight">{title}</p>
      <h2 className="text-4xl font-semibold mt-2 text-slate-900 tracking-tight tabular-nums">{value}</h2>
    </div>
  </div>
);

export default StatCard;