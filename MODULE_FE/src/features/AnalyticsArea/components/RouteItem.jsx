import React from 'react';

const RouteItem = ({ from, to, percent }) => (
  <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
    <div>
      <p className="text-xs text-slate-500 font-medium tracking-tight">{from}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-slate-300">→</span>
        <p className="text-sm font-medium tracking-tight text-slate-900">{to}</p>
      </div>
    </div>
    <span className="bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full text-xs font-medium tracking-tight tabular-nums">
      {percent}
    </span>
  </div>
);

export default RouteItem;