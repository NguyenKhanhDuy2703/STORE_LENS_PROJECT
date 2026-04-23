import { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom'; 
import { loginThunk } from '../auth.thunk'; 


const SignIn = ({ onSwitchToSignUp }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, isLogin } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    identifier: '', 
    password: '',
  });
  const [formErrors, setFormErrors] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLogin) {
      navigate('/'); 
    }
  }, [isLogin, navigate]);

  const validateForm = () => {
    const nextErrors = {
      identifier: '',
      password: '',
    };

    if (!formData.identifier?.trim()) {
      nextErrors.identifier = 'Vui lòng nhập tài khoản';
    }

    if (!formData.password?.trim()) {
      nextErrors.password = 'Vui lòng nhập mật khẩu';
    }

    setFormErrors(nextErrors);
    return !nextErrors.identifier && !nextErrors.password;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    dispatch(loginThunk({ 
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
            Tài khoản
          </label>
          {formErrors.identifier && (
            <p className="mb-1.5 text-xs text-rose-600">{formErrors.identifier}</p>
          )}
          <input
            type="text"
            value={formData.identifier}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({ ...formData, identifier: value });
              if (formErrors.identifier) {
                setFormErrors((prev) => ({ ...prev, identifier: '' }));
              }
            }}
            placeholder="admin, manager_test_1store"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 ${
              formErrors.identifier ? 'border-rose-300' : 'border-slate-300'
            }`}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium tracking-tight text-slate-700 mb-1.5">
            Mật khẩu
          </label>
          {formErrors.password && (
            <p className="mb-1.5 text-xs text-rose-600">{formErrors.password}</p>
          )}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, password: value });
                if (formErrors.password) {
                  setFormErrors((prev) => ({ ...prev, password: '' }));
                }
              }}
              placeholder="Nhập mật khẩu"
              className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 ${
                formErrors.password ? 'border-rose-300' : 'border-slate-300'
              }`}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium tracking-tight rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          <LogIn size={18} />
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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