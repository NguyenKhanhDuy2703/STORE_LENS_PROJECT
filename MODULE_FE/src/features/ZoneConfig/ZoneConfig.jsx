import React, { useMemo, useState, useEffect } from 'react';
import { CameraSidebar } from './components/CameraSidebar';
import { DrawingBoard } from './components/DrawingBoard';
import { ZoneList } from './components/ZoneList';
import { ZoneForm } from './components/ZoneForm';
import { GuideModal } from './components/GuideModal';
import { Save, HelpCircle } from 'lucide-react';

// Constants & Helpers
export const STORAGE_KEY = 'storelens.zone.manager.configs.by.camera';
export const IMAGE_STORAGE_KEY = 'storelens.zone.manager.images.by.camera';
export const CAMERAS = [
  { id: 'cam-01', name: 'Camera 01' },
  { id: 'cam-02', name: 'Camera 02' },
  { id: 'cam-03', name: 'Camera 03' },
  { id: 'cam-04', name: 'Camera 04' }
];

export const ZoneConfig = () => {
  const [selectedCameraId, setSelectedCameraId] = useState(CAMERAS[0].id);
  const [mode, setMode] = useState('draw'); // draw | select | delete
  const [zonesByCamera, setZonesByCamera] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});
  const [cameraImages, setCameraImages] = useState(() => JSON.parse(localStorage.getItem(IMAGE_STORAGE_KEY)) || {});
  const [activeZoneId, setActiveZoneId] = useState(null);
  const [showGuide, setShowGuide] = useState(true);

  // --- TRẠNG THÁI QUAN TRỌNG: Các điểm đang vẽ nháp ---
  const [draftPoints, setDraftPoints] = useState([]); 

  // Lấy dữ liệu riêng cho camera đang chọn
  const zones = useMemo(() => zonesByCamera[selectedCameraId] || [], [selectedCameraId, zonesByCamera]);

  const saveAll = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(zonesByCamera));
    localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(cameraImages));
    alert("Đã lưu cấu hình thành công!");
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 p-4">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Cột trái: Danh sách camera */}
        <aside className="xl:col-span-3">
          <CameraSidebar 
            cameras={CAMERAS} 
            selectedId={selectedCameraId} 
            onSelect={(id) => { 
                setSelectedCameraId(id); 
                setActiveZoneId(null); 
                setDraftPoints([]); // Đổi camera thì xóa điểm đang vẽ dở
            }}
            zonesByCamera={zonesByCamera}
            cameraImages={cameraImages}
          />
        </aside>

        {/* Cột giữa & phải: Khu vực vẽ và cấu hình */}
        <section className="xl:col-span-9 space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <header className="flex justify-between items-center border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
              <h1 className="text-2xl font-bold text-slate-800">
                {CAMERAS.find(c => c.id === selectedCameraId)?.name}
              </h1>
              <button onClick={() => setShowGuide(true)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                <HelpCircle size={22} />
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={saveAll} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-bold shadow-sm transition-all">
                <Save size={18} /> Cập nhật hệ thống
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Khu vực vẽ SVG */}
            <div className="lg:col-span-9">
              <DrawingBoard 
                cameraId={selectedCameraId}
                mode={mode}
                setMode={setMode}
                zones={zones}
                setZonesByCamera={setZonesByCamera}
                cameraImage={cameraImages[selectedCameraId]}
                activeZoneId={activeZoneId}
                setActiveZoneId={setActiveZoneId}
                onImageUpload={(img) => setCameraImages(prev => ({...prev, [selectedCameraId]: img}))}
                // TRUYỀN DỮ LIỆU VẼ XUỐNG ĐÂY
                draftPoints={draftPoints}
                setDraftPoints={setDraftPoints}
              />
            </div>

            {/* Danh sách Zone & Form tạo mới */}
            <div className="lg:col-span-3 space-y-5">
              <ZoneList 
                zones={zones} 
                activeZoneId={activeZoneId} 
                setActiveZoneId={setActiveZoneId}
                onUpdate={(newZones) => setZonesByCamera(prev => ({...prev, [selectedCameraId]: newZones}))}
              />
              
              <ZoneForm 
                // TRUYỀN DỮ LIỆU VẼ SANG ĐÂY ĐỂ NÚT LƯU BIẾT KHI NÀO ĐƯỢC BẤM
                draftPoints={draftPoints}
                onAddZone={(newZone) => {
                   setZonesByCamera(prev => ({...prev, [selectedCameraId]: [...(prev[selectedCameraId] || []), newZone]}));
                   setActiveZoneId(newZone._id);
                   setDraftPoints([]); // Lưu xong thì xóa điểm nháp để vẽ vùng mới
                }}
              />
            </div>
          </div>
        </section>
      </div>
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
};