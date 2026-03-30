import React from 'react';

const AreaTableRow = ({ name, cameraId, live, today, change, time, isUp }) => (
  <tr className="hover:bg-slate-50/50 transition border-b border-gray-50 last:border-none">
    <td className="px-6 py-4 font-bold text-sm text-slate-700">{name}</td>
    <td className="px-6 py-4 text-xs font-mono text-slate-400">{cameraId}</td>
    <td className="px-6 py-4">
      <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold ring-4 ring-emerald-50">
        {live}
      </span>
    </td>
    <td className="px-6 py-4 font-bold text-sm">{today}</td>
    <td className={`px-6 py-4 text-sm font-bold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
      {change}
    </td>
    <td className="px-6 py-4 text-center font-medium text-slate-500 text-sm">{time}</td>
  </tr>
);

export default AreaTableRow;