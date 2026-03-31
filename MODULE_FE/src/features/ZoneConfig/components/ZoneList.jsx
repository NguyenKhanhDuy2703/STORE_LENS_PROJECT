import React from 'react';
import { Eye, EyeOff, Lock, LockOpen, Trash2, Layers } from 'lucide-react';

export const ZoneList = ({ zones, activeZoneId, setActiveZoneId, onUpdate }) => {
  const toggleAction = (id, field) => {
    onUpdate(zones.map(z => z._id === id ? { ...z, [field]: !z[field] } : z));
  };

  const removeZone = (id) => {
    if(confirm("Xóa vùng này?")) onUpdate(zones.filter(z => z._id !== id));
  };

  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 min-h-[300px]">
      <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Vùng đã vẽ ({zones.length})</h3>
      <div className="space-y-2 overflow-y-auto max-h-[400px]">
        {zones.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <Layers size={32} className="mx-auto opacity-20" />
            <p className="text-sm mt-2">Chưa có zone nào</p>
          </div>
        )}
        {zones.map(zone => (
          <div 
            key={zone._id} 
            className={`p-3 rounded-lg bg-white border transition-all ${activeZoneId === zone._id ? 'border-violet-500 shadow-sm' : 'border-slate-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setActiveZoneId(zone._id)} className="flex items-center gap-2 font-semibold text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                {zone.name}
              </button>
              <div className="flex gap-1">
                <button onClick={() => toggleAction(zone._id, 'visible')} className="p-1 hover:bg-slate-100 rounded">
                  {zone.visible ? <Eye size={14}/> : <EyeOff size={14}/>}
                </button>
                <button onClick={() => removeZone(zone._id)} className="p-1 hover:bg-rose-50 text-rose-500 rounded">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {zone.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};