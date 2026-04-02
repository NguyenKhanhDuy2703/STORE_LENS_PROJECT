import React from 'react';
import { X, Video } from 'lucide-react';

export const CameraPreview = ({ camera, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800">Preview: {camera.name}</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter italic">Source: {camera.rtsp_url}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="p-6">
          <div className="aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center text-slate-500 border-4 border-slate-800 shadow-inner">
            <Video size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Đang kết nối tới Edge AI...</p>
            <p className="text-[10px] opacity-50 mt-1">Hệ thống đang giải mã luồng RTSP</p>
          </div>
        </div>
      </div>
    </div>
  );
};