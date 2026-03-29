import React from 'react';
import { Zap, AlertTriangle, Lightbulb } from 'lucide-react';

const infoBox = (colorClass, icon, title, desc) => (
  <div className={`rounded-2xl border ${colorClass.border} bg-white p-4 shadow-sm`}> 
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl ${colorClass.bg} ${colorClass.text}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  </div>
);

const GenAIInsights = () => {
  return (
    <section className="bg-white border border-indigo-100 rounded-2xl shadow-sm p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Danh sách đối tượng & Gợi ý AI</h3>
          <p className="text-xs text-slate-500">Thông tin chi tiết từng cá nhân và khuyến nghị từ GenAI Assistant</p>
        </div>
        <span className="text-xs text-indigo-500">Cập nhật 5 phút trước</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {infoBox(
          { border: 'border-emerald-100', bg: 'bg-emerald-50', text: 'text-emerald-500' },
          <Zap size={18} />, 
          'Xu hướng tích cực',
          'Nhóm Loyal Members tăng 8% trong tuần qua. Khu vực Cardio đang được ưa chuộng nhất.'
        )}
        {infoBox(
          { border: 'border-amber-100', bg: 'bg-amber-50', text: 'text-amber-500' },
          <AlertTriangle size={18} />, 
          'Cần chú ý',
          'Phát hiện nhóm At-Risk Members tăng 20% tại khu vực Máy chạy bộ. Kiểm tra bố trí nhân lực.'
        )}
        {infoBox(
          { border: 'border-sky-100', bg: 'bg-sky-50', text: 'text-sky-500' },
          <Lightbulb size={18} />, 
          'Gợi ý chiến lược',
          'Potential Leads thường ghé vào buổi sáng (7-9h). Tuyển tư vấn viên giờ này.'
        )}
      </div>
    </section>
  );
};

export default GenAIInsights;
