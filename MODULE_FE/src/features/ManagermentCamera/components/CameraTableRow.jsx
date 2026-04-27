import { useState } from 'react';
import { Copy, Pencil, Trash2, Power, Store, Video } from 'lucide-react';
import { CameraStatusBadge } from './CameraStatusBadge';
import { showCompactSuccessAlert } from '../../../utils/swal';

export const CameraTableRow = ({ camera, onDelete, onEdit, onTogglePower, isToggling }) => {
  const [copied, setCopied] = useState(false);
  const cameraName = camera.camera_name || camera.name || 'Chưa đặt tên';
  const cameraCode = camera.camera_code || camera.id || 'N/A';
  const rtspUrl = camera.rtsp_url || camera.rtspUrl || 'N/A';
  const locationName = camera.location_name || camera.storeName || camera.location_id || 'Chưa gán';
  const description = camera.description || cameraCode;
  const normalizedStatus = String(camera.status || '').toLowerCase();
  const isCameraRunning = normalizedStatus === 'active' || normalizedStatus === 'online';

  const handleCopyRtsp = async () => {
    try {
      await navigator.clipboard.writeText(rtspUrl);
      setCopied(true);
      showCompactSuccessAlert({
        title: 'Đã sao chép',
        text: 'RTSP URL đã được copy vào clipboard.',
      });

      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const displayRtsp = rtspUrl.length > 42 ? `${rtspUrl.slice(0, 42)}...` : rtspUrl;

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50/70 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Video size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold leading-tight tracking-tight text-slate-800">{cameraName}</p>
            <p className="mt-1.5 text-xs font-medium text-slate-500 tracking-tight">{description}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="max-w-[360px] rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 tracking-tight tabular-nums">
            {displayRtsp}
          </span>
          <button
            type="button"
            onClick={handleCopyRtsp}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
            title="Sao chép RTSP"
          >
            <Copy size={14} />
            {copied ? 'Đã sao chép' : 'Sao chép'}
          </button>
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-700 tracking-tight">
          <Store size={18} className="text-slate-500" />
          {locationName}
        </span>
      </td>

      <td className="px-5 py-4">
        <CameraStatusBadge status={camera.status} />
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <button
            className="rounded-2xl border border-slate-300 p-2.5 text-slate-600 transition-colors hover:bg-slate-100"
            title="Chỉnh sửa"
            onClick={() => onEdit?.(camera)}
          >
            <Pencil size={18} />
          </button>
          <button
            className="rounded-2xl border border-rose-200 p-2.5 text-rose-600 transition-colors hover:bg-rose-50"
            title="Xóa"
            onClick={() => onDelete?.(cameraCode)}
          >
            <Trash2 size={18} />
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isCameraRunning
                ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
            title={isCameraRunning ? 'Tắt phân tích AI' : 'Bật phân tích AI'}
            onClick={() => onTogglePower?.(camera)}
            disabled={isToggling}
          >
            <Power size={16} />
            {isToggling ? 'Đang xử lý...' : isCameraRunning ? 'Tắt' : 'Bật'}
          </button>
        </div>
      </td>
    </tr>
  );
};
