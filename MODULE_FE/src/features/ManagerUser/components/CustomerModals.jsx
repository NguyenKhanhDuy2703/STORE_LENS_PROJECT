import React from 'react';
import { AlertTriangle, Save, X } from 'lucide-react';

const ModalWrapper = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        {children}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, mono = false }) => (
  <div className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-sm font-medium tracking-tight text-slate-500">{label}</span>
    <span className={`text-sm font-medium tracking-tight text-slate-800 ${mono ? 'font-mono tabular-nums' : ''}`}>
      {value || 'Chưa cập nhật'}
    </span>
  </div>
);

export const DetailModal = ({ isOpen, data, onClose }) => {
  if (!data) return null;

  return (
    <ModalWrapper isOpen={isOpen}>
      <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Chi tiết tài khoản hệ thống</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-6">
        <InfoRow label="Họ và tên" value={data.name} />
        <InfoRow label="Tài khoản" value={data.accountName || 'Chưa cập nhật'} />
        <InfoRow label="Email" value={data.email} />
        <InfoRow label="Vai trò" value={String(data.role || '').toUpperCase()} />
        <InfoRow label="Chi nhánh" value={data.assignedStore} mono />
        <InfoRow label="Mã tài khoản" value={data.id} mono />
        <InfoRow label="Trạng thái truy cập" value={data.status} />
      </div>

      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium tracking-tight hover:bg-slate-100"
        >
          Đóng
        </button>
      </div>
    </ModalWrapper>
  );
};

export const EditModal = ({ isOpen, data, onClose, onSave }) => {
  const [temp, setTemp] = React.useState(data);

  React.useEffect(() => {
    setTemp(data);
  }, [data]);

  if (!temp) return null;

  return (
    <ModalWrapper isOpen={isOpen}>
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Cập nhật tài khoản truy cập</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">Họ và tên</label>
          <input
            value={temp.name}
            onChange={(e) => setTemp({ ...temp, name: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">Vai trò</label>
            <select
              value={temp.role}
              onChange={(e) => setTemp({ ...temp, role: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">Chi nhánh</label>
            <input
              value={temp.assignedStore}
              onChange={(e) => setTemp({ ...temp, assignedStore: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono tabular-nums outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm border border-slate-300 text-slate-700 rounded-lg font-medium tracking-tight hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(temp)}
            className="px-4 py-2.5 text-sm bg-teal-600 text-white rounded-lg flex items-center gap-2 shadow-sm font-medium tracking-tight hover:bg-teal-500"
          >
            <Save size={16} /> Lưu thay đổi
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export const DeleteConfirmModal = ({ isOpen, data, onClose, onConfirm }) => (
  <ModalWrapper isOpen={isOpen}>
    <div className="p-8 text-center">
      <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={32} />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-1">Xóa tài khoản truy cập</h3>
      <p className="text-slate-600 tracking-tight">
        Bạn có chắc muốn xóa tài khoản <span className="font-medium">{data?.name}</span>?
      </p>
      <div className="flex justify-center gap-3 mt-8">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium tracking-tight hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-rose-600 text-white rounded-xl shadow-sm font-medium tracking-tight hover:bg-rose-500"
        >
          Xóa ngay
        </button>
      </div>
    </div>
  </ModalWrapper>
);