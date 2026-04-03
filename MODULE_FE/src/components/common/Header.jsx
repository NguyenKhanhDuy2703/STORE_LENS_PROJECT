import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  LayoutDashboard, BarChart3, MapPin, 
  ChevronDown, Settings,
  Flame, Clock, Camera, User, LogOut, Users, Menu, X,
  Package
} from 'lucide-react';
import NotificationPopover from './NotificationPopover';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = {
    fullName: 'Admin Manager',
    role: 'admin',
    avatar: 'AM',
  };

  // State for dropdowns and mobile menu
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Navigation items
  const navItems = [
    { label: 'Tổng quan', path: '/', icon: <LayoutDashboard size={18} /> },
    { label: 'Bản đồ nhiệt', path: '/heatmap', icon: <Flame size={18} /> },
    { label: 'Thời gian dừng', path: '/dwell-time', icon: <Clock size={18} /> }
  ];

  // Management menu items
  const managementItems = [
    { label: 'Quản lý khách hàng', path: '/quan-ly-khach-hang', icon: <Users size={18} /> },
    { label: 'Quản lý khu vực', path: '/management/area', icon: <MapPin size={18} /> },
    { label: 'Quản lý tài sản', path: '/management/asset', icon: <Package size={18} /> }
  ];

  // Configuration menu items
  const configItems = [
    { label: 'Cấu hình Rule', path: '/config/rules', icon: <BarChart3 size={18} /> },
    { label: 'Cấu hình Camera', path: '/config/camera', icon: <Camera size={18} /> },
    { label: 'Cấu hình Zone', path: '/config/zone', icon: <MapPin size={18} /> }
  ];

  const handleLogout = () => {
    setIsProfileOpen(false);
    navigate('/login'); 
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto h-full px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* LEFT: Logo and Desktop Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-teal-600 hover:bg-teal-500 transition-colors">
                <Flame className="text-white" size={20} />
              </div>
              <span className="text-base font-semibold text-slate-900 hidden lg:inline tracking-tight">
                SpaceLens
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1 border-l border-slate-200 pl-6">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                    isActive(item.path) 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Management Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => { setIsManagementOpen(!isManagementOpen); setIsConfigOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                    managementItems.some(item => isActive(item.path)) 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 size={18} />
                  <span>Quản lý</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isManagementOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isManagementOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full mt-2 left-0 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50"
                    >
                      {managementItems.map(item => (
                        <Link 
                          key={item.path} 
                          to={item.path} 
                          onClick={() => setIsManagementOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            isActive(item.path) 
                              ? 'bg-teal-50 text-teal-700 font-semibold' 
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-teal-600">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Configuration Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => { setIsConfigOpen(!isConfigOpen); setIsManagementOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                    configItems.some(item => isActive(item.path)) 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Settings size={18} />
                  <span>Cấu hình</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isConfigOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isConfigOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full mt-2 left-0 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50"
                    >
                      {configItems.map(item => (
                        <Link 
                          key={item.path} 
                          to={item.path} 
                          onClick={() => setIsConfigOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            isActive(item.path) 
                              ? 'bg-teal-50 text-teal-700 font-semibold' 
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
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

          {/* RIGHT: Actions - Status Badge, Notifications, User Menu */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Online Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-700 text-xs font-semibold uppercase tracking-tight">Trực tuyến</span>
            </div>

            {/* Notification Popover */}
            <NotificationPopover />

            {/* User Menu */}
            <div className="relative hidden sm:block">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                  {currentUser.avatar}
                </div>
                <span className="text-sm font-medium text-slate-900 hidden lg:inline">
                  {currentUser.fullName}
                </span>
                <ChevronDown size={14} className="text-slate-400 hidden lg:inline" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full mt-2 right-0 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50"
                  >
                    {/* Profile Info */}
                    <div className="px-4 py-3 border-b border-slate-200">
                      <p className="text-sm font-semibold text-slate-900">{currentUser.fullName}</p>
                      <p className="text-xs text-slate-500 mt-1 capitalize">{currentUser.role}</p>
                    </div>

                    {/* Menu Items */}
                    {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                      <Link 
                        to="/quan-ly-nguoi-dung"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                      >
                        <Users size={16} className="text-teal-600" />
                        <span>Quản lý truy cập</span>
                      </Link>
                    )}

                    <Link 
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                    >
                      <Settings size={16} className="text-slate-500" />
                      <span>Cài đặt</span>
                    </Link>

                    <div className="border-t border-slate-200 mt-2">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition-colors text-sm font-semibold"
                      >
                        <LogOut size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-slate-200 bg-slate-50"
            >
              <nav className="px-4 py-4 space-y-2">
                {/* Mobile Navigation Items */}
                {navItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                      isActive(item.path) 
                        ? 'bg-teal-100 text-teal-700' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* Mobile Management Section */}
                <div>
                  <button 
                    onClick={() => setIsManagementOpen(!isManagementOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all text-sm font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 size={18} />
                      <span>Quản lý</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform ${isManagementOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all ${isManagementOpen ? 'max-h-48' : 'max-h-0'}`}>
                    {managementItems.map(item => (
                      <Link 
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-8 py-2.5 text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile Configuration Section */}
                <div>
                  <button 
                    onClick={() => setIsConfigOpen(!isConfigOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all text-sm font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <Settings size={18} />
                      <span>Cấu hình</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform ${isConfigOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all ${isConfigOpen ? 'max-h-48' : 'max-h-0'}`}>
                    {configItems.map(item => (
                      <Link 
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-8 py-2.5 text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile User Section */}
                <div className="px-4 py-3 border-t border-slate-200">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-sm font-semibold"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};