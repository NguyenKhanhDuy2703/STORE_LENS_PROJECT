import React, { useRef, useState } from 'react';
import { PencilLine, MousePointer2, Trash2, ImageUp } from 'lucide-react';

const toCanvasPoint = (evt, rect) => ({
  x: Math.max(0, Math.min(1, (evt.clientX - rect.left) / rect.width)),
  y: Math.max(0, Math.min(1, (evt.clientY - rect.top) / rect.height))
});

export const DrawingBoard = ({ cameraId, mode, setMode, zones, setZonesByCamera, cameraImage, activeZoneId, setActiveZoneId, onImageUpload }) => {
  const overlayRef = useRef(null);
  const [draftPoints, setDraftPoints] = useState([]);
  const [cursorPoint, setCursorPoint] = useState(null);

  const handleCanvasClick = (evt) => {
    if (mode !== 'draw') return;
    const rect = overlayRef.current.getBoundingClientRect();
    const point = toCanvasPoint(evt, rect);
    setDraftPoints(prev => [...prev, point]);
  };

  // Logic: Double click hoặc click lại điểm đầu để kết thúc vùng vẽ sẽ được xử lý ở đây
  // ... (Gom logic handleMouseMove, handleVertexDown của bạn vào đây)

  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
      <div className="flex justify-between mb-2">
        <span className="text-xs bg-slate-200 px-3 py-1 rounded-full flex items-center gap-1">
          <PencilLine size={12}/> Click để tạo điểm, double-click để hoàn tất
        </span>
        <div className="flex gap-2 bg-white p-1 rounded-lg border">
          <button onClick={() => setMode('select')} className={`p-2 rounded ${mode === 'select' ? 'bg-blue-600 text-white' : ''}`}><MousePointer2 size={16}/></button>
          <button onClick={() => setMode('draw')} className={`p-2 rounded ${mode === 'draw' ? 'bg-blue-600 text-white' : ''}`}><PencilLine size={16}/></button>
          <button onClick={() => setMode('delete')} className={`p-2 rounded ${mode === 'delete' ? 'bg-rose-600 text-white' : ''}`}><Trash2 size={16}/></button>
        </div>
      </div>

      <div className="relative aspect-video bg-slate-200 rounded-lg overflow-hidden border-2 border-slate-300">
        {cameraImage ? (
          <>
            <img src={cameraImage} className="w-full h-full object-contain select-none" draggable={false} />
            <svg 
               ref={overlayRef} 
               className="absolute inset-0 w-full h-full cursor-crosshair" 
               viewBox="0 0 100 100" 
               preserveAspectRatio="none"
               onClick={handleCanvasClick}
            >
              {/* Render Zones & Draft Points logic */}
              {zones.filter(z => z.visible).map(zone => (
                <polygon 
                  key={zone._id}
                  points={zone.points.map(p => `${p.x * 100},${p.y * 100}`).join(' ')}
                  fill={`${zone.color}4D`}
                  stroke={zone.color}
                  strokeWidth={activeZoneId === zone._id ? 1 : 0.5}
                  onClick={(e) => { e.stopPropagation(); setActiveZoneId(zone._id); }}
                />
              ))}
            </svg>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <ImageUp size={48} />
            <p className="mt-2 font-medium">Chưa có hình camera</p>
            <input type="file" className="mt-4" onChange={(e) => {/* Reader logic */}} />
          </div>
        )}
      </div>
    </div>
  );
};