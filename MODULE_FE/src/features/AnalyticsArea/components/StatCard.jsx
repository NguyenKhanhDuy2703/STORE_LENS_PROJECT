import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, trend, isUp, icon, bgColor }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${bgColor}`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
        {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {trend}
      </div>
    </div>
    <div className="mt-4">
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h2 className="text-3xl font-bold mt-1">{value}</h2>
    </div>
  </div>
);

export default StatCard;