import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, subtitle, change, icon }) => {
  let statusTheme = { 
    container: "text-slate-500 bg-slate-50 border-slate-100", 
    Icon: Minus 
  };

  if (change > 0) {
    statusTheme = { 
      container: "text-teal-600 bg-teal-50 border-teal-100", 
      Icon: TrendingUp 
    };
  } else if (change < 0) {
    statusTheme = { 
      container: "text-rose-600 bg-rose-50 border-rose-100", 
      Icon: TrendingDown 
    };
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
          {React.cloneElement(icon, { size: 22 })}
        </div>
        
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border tracking-tight ${statusTheme.container}`}>
          <statusTheme.Icon size={12} strokeWidth={3} />
          <span>{Math.abs(change)}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-[10px] font-medium text-slate-400 tracking-tight">
          {title}
        </h3>
        <div className="text-4xl font-semibold text-slate-900 tabular-nums tracking-tight">
          {value}
        </div>
        <p className="text-[11px] font-medium text-slate-500 pt-1 tracking-tight">
          {subtitle || "Dữ liệu thời gian thực"}
        </p>
      </div>
    </div>
  );
};

export default StatCard;