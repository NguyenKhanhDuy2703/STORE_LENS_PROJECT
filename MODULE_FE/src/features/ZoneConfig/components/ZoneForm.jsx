import React, { useState } from 'react';
import { Plus, Save } from 'lucide-react';

const colorSwatches = ['#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#10B981', '#F59E0B', '#06B6D4', '#84CC16'];
const zoneTypes = [
  { id: 'checkout', label: 'Khu vực thanh toán' },
  { id: 'shelf', label: 'Khu vực kệ' },
  { id: 'aisle', label: 'Khu vực đi lại' },
  { id: 'entrance', label: 'Lối vào' }
];

export const ZoneForm = ({ onAddZone, draftPoints }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('checkout');
  const [color, setColor] = useState('#EF4444');

  const handleSubmit = () => {
    if (draftPoints.length < 3) return;
    
    onAddZone({
      _id: `${Date.now()}`,
      name: name.trim() || `Zone_${Date.now()}`,
      type,
      color,
      points: draftPoints,
      visible: true,
      locked: false
    });

    setName(''); // Reset form sau khi thêm
  };

  return (
    <div className="rounded-xl border border-violet-200 bg-indigo-50/30 p-4 shadow-sm">
      <h3 className="text-md font-bold text-violet-800 flex items-center gap-2 mb-4">
        <Plus size={18} /> Cấu hình Zone mới
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên vùng</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Zone thanh toán A"
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phân loại</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
          >
            {zoneTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Màu sắc đại diện</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {colorSwatches.map(swatch => (
              <button
                key={swatch}
                onClick={() => setColor(swatch)}
                className={`w-7 h-7 rounded-md border-2 transition-transform ${
                  color === swatch ? 'border-slate-800 scale-110 shadow-md' : 'border-white hover:scale-105'
                }`}
                style={{ backgroundColor: swatch }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={draftPoints.length < 3}
          className="w-full mt-2 bg-violet-600 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-violet-700 transition-all shadow-sm"
        >
          <Save size={18} /> Lưu vùng vừa vẽ
        </button>
      </div>
    </div>
  );
};