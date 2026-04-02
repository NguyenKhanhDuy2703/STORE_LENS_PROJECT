import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { CameraStats } from './components/CameraStats';
import { CameraRow } from './components/CameraRow';
import { CameraForm } from './components/CameraForm';
import { CameraPreview } from './components/CameraPreview';

// --- Cấu hình & Dữ liệu giả ---
export const STORAGE_KEY = 'storelens.camera.manager';
export const STORES = [
  { id: 'STORE001', name: 'Cửa hàng Trung tâm (Quận 1)' },
  { id: 'STORE002', name: 'Cửa hàng Quận 7 (Lotte)' },
  { id: 'STORE003', name: 'Cửa hàng Thủ Đức (Gigamall)' },
  { id: 'STORE004', name: 'Kho tổng Tân Bình' }
];

const initialCameras = [
  { id: 'cam-1', name: 'Cửa ra vào chính', rtsp_url: 'rtsp://admin:123456@192.168.1.10:554/live', store_id: 'STORE001', description: 'Giám sát khách ra vào', status: 'active' },
  { id: 'cam-2', name: 'Khu vực quầy thu ngân', rtsp_url: 'rtsp://admin:123456@192.168.1.11:554/live', store_id: 'STORE001', description: 'Theo dõi thanh toán', status: 'issue' },
  { id: 'cam-3', name: 'Kệ hàng trung tâm', rtsp_url: 'rtsp://admin:123456@192.168.1.12:554/live', store_id: 'STORE002', description: 'Theo dõi hành vi mua sắm', status: 'inactive' }
];

export const CameraZoneConfig = () => {
  const [cameras, setCameras] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialCameras;
  });

  const [modal, setModal] = useState({ type: null, data: null });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cameras));
  }, [cameras]);

  // Logic xử lý
  const handleSave = (formData) => {
    if (modal.data) {
      setCameras(prev => prev.map(c => c.id === modal.data.id ? { ...c, ...formData } : c));
    } else {
      const newCam = { ...formData, id: `cam-${Date.now()}`, status: 'inactive' };
      setCameras(prev => [newCam, ...prev]);
    }
    setModal({ type: null, data: null });
  };

  const handleDelete = (id) => {
    if (window.confirm('Xác nhận xóa camera này?')) {
      setCameras(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setCameras(prev => prev.map(c => 
      c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
    ));
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Cấu hình Camera</h1>
        <button 
          onClick={() => setModal({ type: 'form', data: null })}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} /> Thêm Camera
        </button>
      </div>

      <CameraStats cameras={cameras} />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs uppercase text-slate-500 font-semibold">
              <th className="px-6 py-4">Tên Camera</th>
              <th className="px-6 py-4">RTSP URL</th>
              <th className="px-6 py-4">Cửa hàng</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cameras.map(camera => (
              <CameraRow 
                key={camera.id}
                camera={camera}
                storeName={STORES.find(s => s.id === camera.store_id)?.name}
                onEdit={() => setModal({ type: 'form', data: camera })}
                onPreview={() => setModal({ type: 'preview', data: camera })}
                onDelete={() => handleDelete(camera.id)}
                onToggle={() => handleToggleStatus(camera.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {modal.type === 'form' && <CameraForm data={modal.data} onSave={handleSave} onClose={() => setModal({ type: null, data: null })} />}
      {modal.type === 'preview' && <CameraPreview camera={modal.data} onClose={() => setModal({ type: null, data: null })} />}
    </div>
  );
};