import React from 'react';
import { Camera, Plus } from 'lucide-react';

export const CameraSidebar = ({ cameras, selectedId, onSelect, zonesByCamera, cameraImages }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Danh sách camera</h2>
        <button className="p-1.5 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {cameras.map((camera) => {
          const zoneCount = zonesByCamera[camera.id]?.length || 0;
          const hasImage = Boolean(cameraImages[camera.id]);
          const isActive = selectedId === camera.id;

          return (
            <button
              key={camera.id}
              onClick={() => onSelect(camera.id)}
              className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                isActive 
                ? 'border-violet-400 bg-violet-50/50 ring-1 ring-violet-400' 
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Camera size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{camera.name}</p>
                  <p className="text-xs text-slate-500">ID: {camera.id}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  hasImage ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {hasImage ? 'Đã có hình' : 'Thiếu hình'}
                </span>
                <span className="text-xs font-semibold text-slate-600">{zoneCount} Zones</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};