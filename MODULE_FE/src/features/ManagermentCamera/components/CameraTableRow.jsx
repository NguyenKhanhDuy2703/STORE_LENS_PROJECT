import { CirclePlay, Pencil, Trash2, Power, Store } from 'lucide-react';
import { CameraStatusBadge } from './CameraStatusBadge';

export const CameraTableRow = ({ camera }) => {
  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50/70 transition-colors">
      <td className="px-5 py-4">
        <p className="text-[20px] font-medium leading-none tracking-tight text-slate-800">{camera.name}</p>
        <p className="mt-2 text-xs text-slate-500 tracking-tight">{camera.description}</p>
      </td>

      <td className="px-5 py-4">
        <span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-700 tracking-tight tabular-nums">
          {camera.rtspUrl}
        </span>
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-2 text-[22px] text-slate-700 tracking-tight">
          <Store size={20} className="text-slate-500" />
          {camera.storeName}
        </span>
      </td>

      <td className="px-5 py-4">
        <CameraStatusBadge status={camera.status} />
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-slate-300 p-2 text-slate-600 hover:bg-slate-100" title="Xem truc tiep">
            <CirclePlay size={18} />
          </button>
          <button className="rounded-xl border border-slate-300 p-2 text-slate-600 hover:bg-slate-100" title="Chinh sua">
            <Pencil size={18} />
          </button>
          <button className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50" title="Xoa">
            <Trash2 size={18} />
          </button>
          <button className="rounded-xl border border-slate-300 px-4 py-2 text-lg font-medium text-slate-600 hover:bg-slate-100" title="Bat/Tat">
            <Power className="inline mr-2" size={16} />
            Bat
          </button>
        </div>
      </td>
    </tr>
  );
};
