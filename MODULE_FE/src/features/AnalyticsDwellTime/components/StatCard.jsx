import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, subtitle, change, icon }) => {
  // Logic màu sắc cho badge %
  let statusTheme = { 
    container: "text-slate-500 bg-slate-50 border-slate-100", 
    Icon: Minus 
  };

  if (change > 0) {
    statusTheme = { 
      container: "text-emerald-600 bg-emerald-50 border-emerald-100", 
      Icon: TrendingUp 
    };
  } else if (change < 0) {
    statusTheme = { 
      container: "text-rose-600 bg-rose-50 border-rose-100", 
      Icon: TrendingDown 
    };
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-teal-100 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-6">
        {/* Icon bọc trong khung màu Teal đặc trưng của SpaceLens */}
        <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
          {React.cloneElement(icon, { size: 22 })}
        </div>
        
        {/* Badge % biến động */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusTheme.container} uppercase tracking-tighter`}>
          <statusTheme.Icon size={12} strokeWidth={3} />
          <span>{Math.abs(change)}%</span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
          {title}
        </h3>
        <div className="text-3xl font-black text-slate-800 tracking-tight">
          {value}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <p className="text-[11px] font-bold text-slate-400">
            {subtitle || "Dữ liệu thời gian thực"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;