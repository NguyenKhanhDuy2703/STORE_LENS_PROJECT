import { CameraTableRow } from './CameraTableRow';

export const CameraTable = ({ cameras }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-left text-[11px] font-medium tracking-tight text-slate-500">
              <th className="px-5 py-4">Ten Camera</th>
              <th className="px-5 py-4">RTSP URL</th>
              <th className="px-5 py-4">Cua Hang</th>
              <th className="px-5 py-4">Trang Thai</th>
              <th className="px-5 py-4">Tac Vu</th>
            </tr>
          </thead>
          <tbody>
            {cameras.map((camera) => (
              <CameraTableRow key={camera.id} camera={camera} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
