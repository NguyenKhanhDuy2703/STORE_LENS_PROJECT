import { useState } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

const SignUp = ({ onSwitchToSignIn }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    accountName: '',
    password: '',
    role: 'staff',
    assignedStore: 'STORE001',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');
    setLoading(true);

    if (!formData.fullName || !formData.email || !formData.accountName || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      setLoading(false);
      return;
    }

    console.log('Sign Up', formData);
    setSuccessMessage('Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.');
    setFormData({
      fullName: '',
      email: '',
      accountName: '',
      password: '',
      role: 'staff',
      assignedStore: 'STORE001',
    });
    setLoading(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/60 p-8 sm:p-10 w-full">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Đăng ký tài khoản hệ thống</h1>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          Tạo tài khoản truy cập dành cho nhân sự nội bộ.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
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
          <div>
            <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">Store ID</label>
            <input
              type="text"
              value={formData.assignedStore}
              onChange={(e) => setFormData({ ...formData, assignedStore: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
        </div>

        {error && (
          <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm">{error}</div>
        )}

        {successMessage && (
          <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{successMessage}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium tracking-tight rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          <UserPlus size={18} />
          {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
        </button>
      </form>

      <p className="text-sm text-slate-600 mt-5 text-center">
        Đã có tài khoản?{' '}
        <button type="button" className="text-teal-600 font-medium tracking-tight" onClick={onSwitchToSignIn}>
          Đăng nhập
        </button>
      </p>
    </div>
  );
};

export default SignUp;
