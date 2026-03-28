import React from 'react';

const RouteItem = ({ from, to, percent }) => (
  <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
    <div>
      <p className="text-xs text-slate-500 font-medium">{from}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-slate-300">→</span>
        <p className="text-sm font-bold text-slate-700">{to}</p>
      </div>
    </div>
    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
      {percent}
    </span>
  </div>
);

export default RouteItem;