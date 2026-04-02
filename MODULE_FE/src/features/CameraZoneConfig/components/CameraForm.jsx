import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { STORES } from '../CameraZoneConfig';

export const CameraForm = ({ data, onSave, onClose }) => {
  const [form, setForm] = useState(data || {
    name: '',
    rtsp_url: '',
    store_id: STORES[0].id,
    description: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Vui lòng nhập tên camera');
    if (!form.rtsp_url.startsWith('rtsp://')) return setError('URL phải bắt đầu bằng rtsp://');
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">{data ? 'Cập nhật Camera' : 'Thêm Camera mới'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Tên Camera</label>
            <input autoFocus value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="VD: Camera Sảnh chính" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">RTSP URL</label>
            <input value={form.rtsp_url} onChange={e => setForm({...form, rtsp_url: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="rtsp://admin:123@192.168..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Cửa hàng</label>
                <select value={form.store_id} onChange={e => setForm({...form, store_id: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                  {STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
             </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Mô tả</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
          </div>
          {error && <p className="text-rose-500 text-xs font-medium">{error}</p>}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg flex items-center gap-2 shadow-sm transition-all">
              <Save size={16} /> Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};