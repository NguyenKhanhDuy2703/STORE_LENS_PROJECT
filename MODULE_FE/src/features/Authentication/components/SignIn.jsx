import { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux'; // 1. Import hooks
import { useNavigate, Link } from 'react-router-dom'; // Để chuyển trang sau khi login
import { loginUser } from '../auth.thunk'; // 2. Import thunk
import { clearError } from '../authSlice'; // 3. Import action xóa lỗi

const SignIn = ({ onSwitchToSignUp }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 4. Lấy trạng thái từ Redux store
  const { isLoading, error, isLogin } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    identifier: '', // Đây sẽ đóng vai trò là "account" gửi lên BE
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // 5. Nếu đăng nhập thành công (isLogin = true), chuyển hướng về Dashboard
  useEffect(() => {
    if (isLogin) {
      navigate('/'); // Hoặc trang chủ của bạn
    }
  }, [isLogin, navigate]);

  // 6. Xóa lỗi cũ khi vừa vào trang
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.identifier || !formData.password) {
      return;
    }

    // 7. Dispatch thunk loginUser
    // Chúng ta truyền object đúng cấu trúc BE cần: { account, password }
    dispatch(loginUser({ 
      account: formData.identifier, 
      password: formData.password 
    }));
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

        {/* 8. Hiển thị lỗi từ Redux */}
        {error && (
          <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium tracking-tight rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          <LogIn size={18} />
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <p className="text-sm text-slate-600 mt-5 text-center">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-teal-600 font-medium tracking-tight hover:text-teal-500 transition-colors">
          Đăng ký
        </Link>
      </p>
    </div>
  );
};

export default SignIn;