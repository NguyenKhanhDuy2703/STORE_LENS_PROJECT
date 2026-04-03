import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

const defaultForm = {
  fullName: '',
  email: '',
  accountName: '',
  password: '',
  role: 'staff',
  assignedStore: 'STORE001',
};

export const CreateUserModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState(defaultForm);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      setFormData(defaultForm);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-160 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <UserPlus size={20} className="text-teal-600" />
            Thêm tài khoản hệ thống
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">Họ và tên</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">Tên tài khoản</label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">Vai trò</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">Chi nhánh</label>
            <input
              type="text"
              value={formData.assignedStore}
              onChange={(e) => setFormData({ ...formData, assignedStore: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm tracking-tight tabular-nums outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium tracking-tight hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg bg-teal-600 text-white font-medium tracking-tight hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
