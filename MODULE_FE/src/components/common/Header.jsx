import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux'; // Thêm cái này
import { logoutUser } from '../../features/Authentication/auth.thunk';
import {
  LayoutDashboard, BarChart3, MapPin,
  ChevronDown, Settings,
  Flame, Clock, Camera, LogOut, Users,
  Package, Bell
} from 'lucide-react';
import NotificationPopover from './NotificationPopover';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, allocation } = useSelector((state) => state.filter);



  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Logic Đăng xuất
  const handleLogout = () => {
    setIsProfileOpen(false);
    dispatch(logoutUser()).then(() => {
      navigate('/login');
    });
  };

  // Menu items (Giữ nguyên của bạn)
  const navItems = [
    { label: 'Tổng quan', path: '/', icon: <LayoutDashboard size={18} /> },
    { label: 'Bản đồ nhiệt', path: '/heatmap', icon: <Flame size={18} /> },
    { label: 'Thời gian dừng', path: '/dwell-time', icon: <Clock size={18} /> }
  ];

  const managementItems = [
    { label: 'Quản lý khách hàng', path: 'management/customers', icon: <Users size={18} /> },
    { label: 'Quản lý khu vực', path: 'management/areas', icon: <MapPin size={18} /> },
    { label: 'Quản lý tài sản', path: 'management/assets', icon: <Package size={18} /> }
  ];

  const configItems = [
    { label: 'Cấu hình Rule', path: 'config/rules', icon: <BarChart3 size={18} /> },
    { label: 'Cấu hình Camera', path: 'config/cameras', icon: <Camera size={18} /> },
    { label: 'Cấu hình Zone', path: 'config/zones', icon: <MapPin size={18} /> }
  ];

  return (
    <header className="sticky top-0 z-[120] w-full h-16 border-b border-slate-200 bg-white shadow-sm overflow-visible">
      <div className="mx-auto h-full px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* LEFT: Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-teal-600 hover:bg-teal-500 transition-colors">
                <Flame className="text-white" size={20} />
              </div>
              <span className="text-base font-semibold text-slate-900 tracking-tight">SpaceLens</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 border-l border-slate-200 pl-6 relative z-[121]">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${isActive(item.path) ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Dropdown Quản lý */}
              <div className="relative">
                <button
                  onClick={() => { setIsManagementOpen(!isManagementOpen); setIsConfigOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${managementItems.some(item => isActive(item.path)) ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <BarChart3 size={18} />
                  <span>Quản lý</span>
                  <ChevronDown size={14} className={`transition-transform ${isManagementOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isManagementOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full mt-2 left-0 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-[130]">
                      {managementItems.map(item => (
                        <Link key={item.path} to={item.path} onClick={() => setIsManagementOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm ${isActive(item.path) ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                          <span className="text-teal-600">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dropdown Cấu hình */}
              <div className="relative">
                <button
                  onClick={() => { setIsConfigOpen(!isConfigOpen); setIsManagementOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${configItems.some(item => isActive(item.path)) ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <Settings size={18} />
                  <span>Cấu hình</span>
                  <ChevronDown size={14} className={`transition-transform ${isConfigOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isConfigOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full mt-2 left-0 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-[130]">
                      {configItems.map(item => (
                        <Link key={item.path} to={item.path} onClick={() => setIsConfigOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm ${isActive(item.path) ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                          <span className="text-teal-600">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-700 text-xs font-semibold uppercase">Trực tuyến</span>
            </div>

            <div className="relative">
              <button
                onClick={() => navigate('/notification')}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <Bell size={20} className="text-slate-600" />

              </button>
            </div>

            {/* Profile Menu */}
            <div className="relative z-[121]">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-teal-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {getInitials(user?.fullname)}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-slate-900">{user?.fullname || allocation?.name || 'Cửa hàng'}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full mt-2 right-0 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-[130]">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <p className="text-sm font-semibold text-slate-900">{user?.fullname}</p>
                      <p className="text-xs text-slate-500 mt-1 uppercase">{user?.role}</p>
                    </div>

                    {(user?.role === 'ADMIN' || user?.role === 'ADMIN_SUPER') && (
                      <Link to="/quan-ly-nguoi-dung" onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 text-sm">
                        <Users size={16} className="text-teal-600" />
                        <span>Quản lý truy cập</span>
                      </Link>
                    )}

                    <Link to="/settings" onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 text-sm">
                      <Settings size={16} className="text-slate-500" />
                      <span>Cài đặt</span>
                    </Link>

                    <div className="border-t border-slate-200 mt-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 text-sm font-bold">
                        <LogOut size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};