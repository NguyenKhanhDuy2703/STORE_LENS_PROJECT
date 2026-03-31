import React from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const GuideModal = ({ onClose }) => {
  const rules = [
    { title: 'Tỷ lệ ảnh chuẩn', desc: 'Bắt buộc dùng ảnh Snapshot từ camera (16:9).', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Vẽ mặt sàn', desc: 'Chỉ vẽ vùng sàn nhà khách đi lại. Tránh vẽ lên trần hoặc kệ.', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Kích thước', desc: 'Vùng vẽ phải đủ rộng để bao trọn ít nhất 1 người đứng.', bg: 'bg-amber-50', border: 'border-amber-100' },
    { title: 'Tránh chồng lấn', desc: 'Hạn chế các vùng đè lên nhau để tránh đếm trùng khách.', bg: 'bg-violet-50', border: 'border-violet-100' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-600">
            <AlertTriangle size={24} />
            <h3 className="text-xl font-bold">Quy tắc vẽ Zone chuẩn AI</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${rule.bg} ${rule.border}`}>
                <h4 className="font-bold text-slate-800 text-sm mb-1">{idx + 1}. {rule.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rule.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-[11px] text-slate-500 text-center italic">
              "Việc tuân thủ quy tắc vẽ giúp AI Tracking và Heatmap đạt độ chính xác trên 95%"
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md"
          >
            <CheckCircle2 size={20} /> Đã hiểu, bắt đầu vẽ
          </button>
        </div>
      </div>
    </div>
  );
};