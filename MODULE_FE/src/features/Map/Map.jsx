import { useMemo, useState } from 'react';
import { Camera, Upload, Save, Edit3, Trash2, Plus } from 'lucide-react';

const MOCK_CAMERAS = [
  { id: 'CAM001', name: 'Camera Sanh Chinh' },
  { id: 'CAM002', name: 'Camera Quay Thanh Toan' },
  { id: 'CAM003', name: 'Camera Khu Vuc Giam Gia' },
];

const MOCK_ZONES = {
  CAM001: [
    { zoneId: 'Z001', zoneName: 'Loi Vao', categoryName: 'Di chuyen', color: '#0d9488', points: 4 },
    { zoneId: 'Z002', zoneName: 'Khu Trung Bay', categoryName: 'Ban hang', color: '#3b82f6', points: 4 },
  ],
  CAM002: [
    { zoneId: 'Z003', zoneName: 'Quay Thu Ngan', categoryName: 'Thanh toan', color: '#f97316', points: 4 },
  ],
  CAM003: [],
};

const Map = () => {
  const [selectedCameraId, setSelectedCameraId] = useState(MOCK_CAMERAS[0].id);
  const [showGuide, setShowGuide] = useState(true);

  const selectedCamera = useMemo(
    () => MOCK_CAMERAS.find((cam) => cam.id === selectedCameraId) || MOCK_CAMERAS[0],
    [selectedCameraId]
  );

  const zones = MOCK_ZONES[selectedCamera.id] || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {showGuide && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium tracking-tight text-blue-900">Huong Dan Ve Zone (Mock UI)</h3>
              <p className="mt-1 text-xs text-blue-800 tracking-tight">
                Ban tam thoi: giu UI hoan chinh de demo. Chua co logic luu/cap nhat that.
              </p>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="rounded-md border border-blue-300 bg-white px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              Dong
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium tracking-tight text-slate-900">Danh Sach Camera</h2>
            <button className="rounded-md bg-teal-600 px-2 py-1 text-xs font-medium text-white hover:bg-teal-500">
              + Them
            </button>
          </div>

          <div className="space-y-2">
            {MOCK_CAMERAS.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setSelectedCameraId(cam.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                  cam.id === selectedCamera.id
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Camera size={16} />
                  <span className="text-sm font-medium tracking-tight">{cam.name}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">ID: {cam.id}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="col-span-9 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <h1 className="text-lg font-medium tracking-tight text-slate-900">{selectedCamera.name}</h1>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Upload size={16} /> Upload Anh
              </button>
              <button className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-400">
                <Save size={16} /> Cap Nhat
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            <div className="col-span-5">
              <div className="relative flex h-[460px] items-center justify-center rounded-lg border border-slate-200 bg-slate-100">
                <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                  Mock Canvas: UI only
                </div>
                <div className="text-center">
                  <Camera size={44} className="mx-auto text-slate-400" />
                  <p className="mt-2 text-sm font-medium tracking-tight text-slate-600">Vung hien thi canvas zone</p>
                  <p className="text-xs text-slate-500 tracking-tight">Tam thoi tat logic ve/luu, giu bo cuc UI</p>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium tracking-tight text-slate-900">Zones ({zones.length})</h3>
                  <button className="rounded-md bg-teal-600 p-1.5 text-white hover:bg-teal-500">
                    <Plus size={14} />
                  </button>
                </div>

                <div className="space-y-2">
                  {zones.length === 0 && (
                    <p className="rounded-md border border-dashed border-slate-300 bg-white p-3 text-center text-xs text-slate-500">
                      Chua co zone nao
                    </p>
                  )}

                  {zones.map((zone) => (
                    <div key={zone.zoneId} className="rounded-md border border-slate-200 bg-white p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: zone.color }} />
                          <span className="truncate text-xs font-semibold text-slate-900">{zone.zoneName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="rounded p-1 text-slate-500 hover:bg-blue-50 hover:text-blue-600">
                            <Edit3 size={13} />
                          </button>
                          <button className="rounded p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 tracking-tight">
                        {zone.categoryName} | {zone.points} diem
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Map;
