import React from 'react';

import { X, User, BarChart3, AlertTriangle, Save, Zap, Clock, MapPin } from 'lucide-react';
// Wrapper dùng chung cho các Modal
const ModalWrapper = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {children}
      </div>
    </div>
  );
};

export const DetailModal = ({ isOpen, data, onClose, onOpenEdit, onConfirmDelete }) => {
  if (!data) return null;

  // Dòng hiển thị Thông tin (Label bên trái, Value bên phải)
  const InfoRow = ({ label, value, isBlue = false }) => (
    <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <span className={`text-sm font-semibold ${isBlue ? 'text-indigo-600' : 'text-slate-800'}`}>
        {value || 'Chưa cập nhật'}
      </span>
    </div>
  );

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      {/* Header Modal */}
      <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800">Chi tiết khách hàng</h2>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
        >
          Đóng
        </button>
      </div>

      {/* Nội dung chính */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
        
        {/* CỘT TRÁI: THÔNG TIN QUẢN LÝ */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            Thông tin quản lý
          </h3>
          <div className="space-y-1">
            <InfoRow label="Tên:" value={data.name} />
            <InfoRow label="Điện thoại:" value={data.phone} />
            <InfoRow label="Email:" value={data.email} />
            <InfoRow label="ID:" value={data.id} />
            <InfoRow label="Gói tập:" value={data.membershipPackage} />
            <InfoRow label="Ngày hết hạn:" value={data.expiryDate} />
            <InfoRow label="Trạng thái:" value={data.status} />
          </div>
        </div>

        {/* CỘT PHẢI: PHÂN TÍCH HÀNH VI */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            Phân tích hành vi
          </h3>
          <div className="space-y-1">
            <InfoRow label="Nhóm hành vi:" value={data.behaviorGroup || 'Không xác định'} />
            <InfoRow label="Tier:" value={data.tier || 'Không xác định'} />
            <InfoRow label="Lần cuối:" value={data.lastSeen || 'Chưa có dữ liệu'} />
            <InfoRow label="Lượt/30 ngày:" value={data.visitsPerMonth || 'Chưa có dữ liệu'} />
            <InfoRow label="Thời gian dừng:" value={`${data.dwellTime || 'Chưa có dữ liệu'} phút`} />
            <InfoRow label="Zone ưa thích:" value={data.preferredZone || 'Tap the luc'} isBlue />
          </div>

          {/* AI Insight Box (Màu xanh giống ảnh) */}
          <div className="mt-6 p-5 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <p className="text-sm font-bold text-blue-700 mb-2">AI Insight</p>
            <p className="text-[13px] text-blue-600 leading-relaxed font-medium">
              Khuyến nghị: Thiết lập chương trình khuyến mãi 1:1 cho nhóm {data.behaviorGroup || 'Không xác định'} để tăng giữ chân.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Modal: Các nút bấm */}
      <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
        <button 
          onClick={onClose}
          className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
        >
          Đóng
        </button>
        <button 
          onClick={() => onOpenEdit(data)}
          className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
        >
          Sửa
        </button>
        <button 
          onClick={() => onConfirmDelete(data)}
          className="px-6 py-2.5 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all"
        >
          Xóa
        </button>
      </div>
    </ModalWrapper>
  );
};

// ... Các Modal Edit và Delete bên dưới giữ nguyên logic

// --- 2. MODAL CHỈNH SỬA ---
export const EditModal = ({ isOpen, data, onClose, onSave }) => {
  const [temp, setTemp] = React.useState(data);
  React.useEffect(() => setTemp(data), [data]);
  if (!temp) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Cập nhật thông tin">
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase">Tên khách hàng</label>
          <input value={temp.name} onChange={e => setTemp({...temp, name: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600">Hủy</button>
          <button onClick={() => onSave(temp)} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg flex items-center gap-2 shadow-md">
            <Save size={16}/> Lưu thay đổi
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

// --- 3. MODAL XÓA ---
export const DeleteConfirmModal = ({ isOpen, data, onClose, onConfirm }) => (
  <ModalWrapper isOpen={isOpen} onClose={onClose} title="Xác nhận xóa">
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={32} />
      </div>
      <p className="text-slate-600">Bạn có chắc muốn xóa <span className="font-bold">{data?.name}</span>?</p>
      <div className="flex justify-center gap-3 mt-8">
        <button onClick={onClose} className="px-6 py-2 border rounded-xl hover:bg-slate-50">Hủy</button>
        <button onClick={onConfirm} className="px-6 py-2 bg-rose-600 text-white rounded-xl shadow-md">Xóa ngay</button>
      </div>
    </div>
  </ModalWrapper>
);