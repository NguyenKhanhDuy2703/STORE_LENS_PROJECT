import React from 'react';
import { CirclePlay, PenLine, Trash2, Store, Wifi, WifiOff } from 'lucide-react';

const getMaskedRtsp = (url) => {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//***:***@${parsed.host}${parsed.pathname}`;
  } catch { return url; }
};

const getStatusStyle = (status) => {
  const map = {
    active: { label: 'Hoạt động', class: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    issue: { label: 'Lỗi kết nối', class: 'bg-rose-50 text-rose-700 border-rose-100' },
    inactive: { label: 'Ngoại tuyến', class: 'bg-slate-100 text-slate-600 border-slate-200' }
  };
  return map[status] || map.inactive;
};

export const CameraRow = ({ camera, storeName, onEdit, onPreview, onDelete, onToggle }) => {
  const status = getStatusStyle(camera.status);
  
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="font-semibold text-slate-800">{camera.name}</div>
        <div className="text-xs text-slate-500 line-clamp-1">{camera.description || 'Không có mô tả'}</div>
      </td>
      <td className="px-6 py-4">
        <code className="text-[11px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
          {getMaskedRtsp(camera.rtsp_url)}
        </code>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        <div className="flex items-center gap-1.5"><Store size={14} className="text-slate-400" /> {storeName}</div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.class}`}>
          {camera.status === 'active' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          {status.label}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <button onClick={onPreview} title="Xem trực tiếp" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><CirclePlay size={18} /></button>
          <button onClick={onEdit} title="Sửa" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><PenLine size={18} /></button>
          <button onClick={onDelete} title="Xóa" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
          <button onClick={onToggle} className={`ml-2 text-[10px] font-bold uppercase px-2 py-1 rounded border transition-all ${camera.status === 'active' ? 'border-rose-200 text-rose-500 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
            {camera.status === 'active' ? 'Tắt' : 'Bật'}
          </button>
        </div>
      </td>
    </tr>
  );
};