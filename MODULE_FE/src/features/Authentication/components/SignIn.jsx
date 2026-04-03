import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const SignIn = ({ onSwitchToSignUp }) => {

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.identifier || !formData.password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập');
      setLoading(false);
      return;
    }

    console.log('Sign In', formData);
    setLoading(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/60 p-8 sm:p-10 w-full">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Đăng nhập hệ thống</h1>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          Truy cập SpaceLens bằng tài khoản hệ thống của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">
            Tên tài khoản hoặc Email
          </label>
          <input
            type="text"
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            placeholder="admin hoặc admin@spacelens.vn"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Nhập mật khẩu"
              className="w-full px-3 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
              required
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

        {error && (
          <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium tracking-tight rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          <LogIn size={18} />
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-6 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 shadow-sm">
        <p className="font-medium tracking-tight text-slate-700 mb-1">Tài khoản mẫu:</p>
        <p className="tabular-nums">SuperAdmin: superadmin / 123456</p>
        <p className="tabular-nums">Admin: admin / 123456</p>
        <p className="tabular-nums">Manager: manager / 123456</p>
      </div>

      <p className="text-sm text-slate-600 mt-5 text-center">
        Chưa có tài khoản?{' '}
        <button type="button" className="text-teal-600 font-medium tracking-tight" onClick={onSwitchToSignUp}>
          Đăng ký
        </button>
      </p>
    </div>
  );
};

export default SignIn;
