import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  LayoutDashboard, BarChart3, MapPin, 
  ChevronDown, SlidersHorizontal,
  Flame, Clock, Camera, User, LogOut, Settings2, Layers, Bell
} from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const mockUser = {
    fullName: "Admin SpaceLens",
    role: "Quản trị viên"
  };

  // State cho 2 Dropdown chính và Profile
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Menu QUẢN LÝ
  const managementItems = [
    { label: 'quản lý khu vực', path: '/analytics/area', icon: <MapPin size={18} /> },
    { label: 'quản lý khách hàng', path: '/customer-management', icon: <User size={18} /> },
  ];

  // Menu CẤU HÌNH
  const configItems = [
    { label: 'Cấu hình Rule', path: '/analytics/rules', icon: <SlidersHorizontal size={18} /> },
    { label: 'Cấu hình Camera', path: '/camera-config', icon: <Camera size={18} /> },
    { label: 'Cấu hình Zone', path: '/zone-config', icon: <Layers size={18} /> }
  ];

  const navItems = [
    { label: 'Tổng quan', path: '/', icon: <LayoutDashboard size={18} /> },
    { label: 'Bản đồ nhiệt', path: '/heatmap', icon: <Flame size={18} /> },
    { label: 'Thời gian dừng', path: '/dwell-time', icon: <Clock size={18} /> }
  ];

  const handleLogout = () => {
    setIsProfileOpen(false);
    navigate('/login'); 
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto h-full px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Bên trái: Logo và 2 Dropdown điều hướng */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-500 transition-transform group-hover:scale-105 shadow-sm">
                <Flame className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-slate-900 hidden lg:block tracking-tight">SpaceLens</span>
            </Link>

            <nav className="hidden xl:flex items-center gap-1 border-l border-slate-200 ml-4 pl-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${isActive(item.path) ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {item.icon}
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              ))}

              {/* Dropdown QUẢN LÝ */}
              <div className="relative ml-1">
                <button 
                  onClick={() => { setIsManagementOpen(!isManagementOpen); setIsConfigOpen(false); }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all outline-none ${
                    managementItems.some(item => isActive(item.path)) ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 size={18} />
                  <span className="font-medium text-sm">Quản Lý</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isManagementOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isManagementOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full mt-2 left-0 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50"
                    >
                      {managementItems.map(item => (
                        <Link key={item.path} to={item.path} onClick={() => setIsManagementOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${isActive(item.path) ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {item.icon} <span>{item.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dropdown CẤU HÌNH */}
              <div className="relative ml-1">
                <button 
                  onClick={() => { setIsConfigOpen(!isConfigOpen); setIsManagementOpen(false); }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all outline-none ${
                    configItems.some(item => isActive(item.path)) ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Settings2 size={18} />
                  <span className="font-medium text-sm">Cấu hình</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isConfigOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isConfigOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full mt-2 left-0 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50"
                    >
                      {configItems.map(item => (
                        <Link key={item.path} to={item.path} onClick={() => setIsConfigOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${isActive(item.path) ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {item.icon} <span>{item.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>

          {/* Bên phải: LIVE badge, Thông báo và Profile */}
          <div className="flex items-center gap-4">
            {/* LIVE Badge */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider">Live</span>
            </div>

            {/* CHUÔNG THÔNG BÁO (Mới thêm) */}
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            {/* Profile Section */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                  <User size={18} />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-bold text-slate-900 leading-none">{mockUser.fullName}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full mt-2 right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl py-1 z-50"
                  >
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-rose-600 hover:bg-rose-50 transition-colors">
                      <LogOut size={18} />
                      <span className="text-sm font-bold">Đăng xuất</span>
                    </button>
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