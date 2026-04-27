import { CameraTableRow } from './CameraTableRow';

export const CameraTable = ({ cameras, onDelete, onEdit, onTogglePower, togglingCameraCode }) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-black/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-left text-xs font-semibold tracking-tight text-slate-600">
              <th className="px-5 py-4">Tên Camera</th>
              <th className="px-5 py-4">RTSP URL</th>
              <th className="px-5 py-4">Cửa hàng</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {cameras.map((camera) => (
              <CameraTableRow
                key={camera.id || camera.camera_code}
                camera={camera}
                onDelete={onDelete}
                onEdit={onEdit}
                onTogglePower={onTogglePower}
                isToggling={togglingCameraCode === (camera.camera_code || camera.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
