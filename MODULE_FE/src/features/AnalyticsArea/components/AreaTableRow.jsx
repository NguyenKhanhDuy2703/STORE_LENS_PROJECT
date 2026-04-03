import React from 'react';

const AreaTableRow = ({ name, cameraId, live, today, change, time, isUp }) => (
  <tr className="hover:bg-slate-50 transition">
    <td className="px-6 py-4 font-medium text-sm tracking-tight text-slate-900">{name}</td>
    <td className="px-6 py-4 text-xs text-slate-600 tracking-tight tabular-nums">{cameraId}</td>
    <td className="px-6 py-4">
      <span className="inline-flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
        {live}
      </span>
    </td>
    <td className="px-6 py-4 text-sm font-medium text-slate-900 tracking-tight tabular-nums">{today}</td>
    <td className={`px-6 py-4 text-sm font-medium tracking-tight tabular-nums ${isUp ? 'text-teal-600' : 'text-rose-600'}`}>
      {change}
    </td>
    <td className="px-6 py-4 text-center font-medium text-slate-600 text-sm tracking-tight tabular-nums">{time}</td>
  </tr>
);

export default AreaTableRow;