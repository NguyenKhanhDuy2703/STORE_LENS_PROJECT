import { useState, useEffect } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { registerThunk } from '../auth.thunk';
import { useNavigate } from 'react-router-dom';
const SignUp = ({ onSwitchToSignIn }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', accountName: '', password: '', role: 'USER', assignedStore: ''
  });
  const goToSignIn = onSwitchToSignIn || (() => navigate('/login'));

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timer = setTimeout(() => goToSignIn(), 2000);
    return () => clearTimeout(timer);
  }, [success, goToSignIn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerThunk({
      fullname: formData.fullName,
      email: formData.email,
      account: formData.accountName,
      password: formData.password,
      role: formData.role.toUpperCase(),
      location_id: formData.assignedStore
    })).unwrap().then(() => {
      setSuccess(true);
    });
  };

  return (
    // WRAPPER: Đẩy mọi thứ vào giữa màn hình
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      
      {/* CARD: Giới hạn độ rộng, bo góc và đổ bóng */}
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 sm:p-10 transform transition-all">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Đăng ký SpaceLens</h1>
          <p className="text-sm text-slate-500 mt-2">Hệ thống phân tích không gian nội bộ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hàng 1: Họ tên & Tài khoản */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Họ tên" placeholder="Văn A" value={formData.fullName} 
              onChange={v => setFormData({...formData, fullName: v})} />
            <Input label="Tài khoản" placeholder="username" value={formData.accountName} 
              onChange={v => setFormData({...formData, accountName: v})} />
          </div>

          {/* Hàng 2: Email */}
          <Input label="Email hệ thống" type="email" placeholder="name@spacelens.vn" value={formData.email} 
            onChange={v => setFormData({...formData, email: v})} />

          {/* Hàng 3: Mật khẩu */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Mật khẩu</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={formData.password} 
                required 
                minLength={6}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Hàng 4: Vai trò & Mã Store */}
          <div className="grid grid-cols-2 gap-3">
            <Select label="Vai trò" value={formData.role} onChange={v => setFormData({...formData, role: v})}
              options={[{v: 'USER', t: 'Staff'}, {v: 'MANAGER', t: 'Manager'}, {v: 'ADMIN', t: 'Admin'}]} />
            <Input label="Mã Store" placeholder="LOC001" value={formData.assignedStore} 
              onChange={v => setFormData({...formData, assignedStore: v.toUpperCase()})} />
          </div>

          {/* Thông báo */}
          {error && <Msg type="error" text={error} />}
          {success && <Msg type="success" text="Tạo tài khoản thành công! Đang chuyển hướng..." />}

          {/* Nút Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-teal-200"
          >
            <UserPlus size={18} />
            {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-8 text-center">
          Đã có tài khoản?{' '}
          <button onClick={() => navigate('/login')} className="text-teal-600 font-bold hover:underline">
            Đăng nhập ngay
          </button>
        </p>
      </div>
    </div>
  );
};

/* --- Sub-components để code sạch hơn --- */
const Input = ({ label, type = "text", ...props }) => (
  <div className="w-full">
    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">{label}</label>
    <input 
      type={type} {...props} onChange={e => props.onChange(e.target.value)} required
      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="w-full">
    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">{label}</label>
    <select 
      {...props} onChange={e => props.onChange(e.target.value)}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer"
    >
      {options.map(opt => <option key={opt.v} value={opt.v}>{opt.t}</option>)}
    </select>
  </div>
);

const Msg = ({ type, text }) => (
  <div className={`px-3 py-2 rounded-lg border text-[11px] font-medium animate-pulse ${
    type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
  }`}>
    {text}
  </div>
);

export default SignUp;