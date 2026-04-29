import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/Authentication/auth.thunk';
import {
  LayoutDashboard, BarChart3, MapPin,
  ChevronDown, Settings,
  Flame, Clock, Camera, LogOut, Users,
  Package, Bell, GitBranch
} from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, allocation } = useSelector((state) => state.filter);
  const { unreadCount = 0 } = useSelector((state) => state.notification || {});

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    setIsProfileOpen(false);
    dispatch(logoutUser()).then(() => navigate('/login'));
  };

  const navItems = [
    { label: 'Tổng quan', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
    { label: 'Bản đồ nhiệt', path: '/heatmap', icon: <Flame size={16} /> },
    { label: 'Thời gian dừng', path: '/dwell-time', icon: <Clock size={16} /> },
    { label: 'Luồng di chuyển', path: '/analytics/flow', icon: <GitBranch size={16} /> },
  ];

  const managementItems = [
    { label: 'Quản lý khách hàng', path: 'management/customers', icon: <Users size={16} /> },
    { label: 'Quản lý khu vực', path: 'management/areas', icon: <MapPin size={16} /> },
    { label: 'Quản lý tài sản', path: 'management/assets', icon: <Package size={16} /> },
  ];

  const configItems = [
    { label: 'Cấu hình Rule', path: 'config/rules', icon: <BarChart3 size={16} /> },
    { label: 'Cấu hình Camera', path: 'config/cameras', icon: <Camera size={16} /> },
    { label: 'Cấu hình Zone', path: 'config/zones', icon: <MapPin size={16} /> },
  ];

  const dropdownMotion = {
    initial: { opacity: 0, y: 6, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 6, scale: 0.97 },
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  };

  const isNotificationActive = location.pathname === '/notification';

  return (
    <header className="sticky top-0 z-[120] w-full h-16 border-b border-border bg-card shadow-sm overflow-visible">
      <div className="mx-auto h-full px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* LEFT: Logo & Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-accent shadow-accent transition-all duration-200 group-hover:shadow-accent-lg group-hover:-translate-y-0.5">
                <Flame className="text-white" size={17} />
              </div>
              <span className="text-sm font-semibold text-foreground tracking-tight">SpaceLens</span>
            </Link>

            {/* Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 border-l border-border pl-6 relative z-[121]">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-accent/8 text-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    managementItems.some((item) => location.pathname.includes(item.path))
                      ? 'bg-accent/8 text-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <BarChart3 size={16} />
                  <span>Quản lý</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${isManagementOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isManagementOpen && (
                    <motion.div {...dropdownMotion}
                      className="absolute top-full mt-2 left-0 w-52 bg-card border border-border rounded-xl shadow-lg py-1.5 z-[130]">
                      {managementItems.map((item) => (
                        <Link key={item.path} to={item.path} onClick={() => setIsManagementOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                            location.pathname.includes(item.path)
                              ? 'bg-accent/8 text-accent font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}>
                          <span className="text-accent">{item.icon}</span>
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    configItems.some((item) => location.pathname.includes(item.path))
                      ? 'bg-accent/8 text-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Settings size={16} />
                  <span>Cấu hình</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${isConfigOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isConfigOpen && (
                    <motion.div {...dropdownMotion}
                      className="absolute top-full mt-2 left-0 w-56 bg-card border border-border rounded-xl shadow-lg py-1.5 z-[130]">
                      {configItems.map((item) => (
                        <Link key={item.path} to={item.path} onClick={() => setIsConfigOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                            location.pathname.includes(item.path)
                              ? 'bg-accent/8 text-accent font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}>
                          <span className="text-accent">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tab Thông báo — nằm cạnh Cấu hình */}
              <Link
                to="/notification"
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isNotificationActive
                    ? 'bg-accent/8 text-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Bell size={16} />
                <span>Thông báo</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-dot" />
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-700">Trực tuyến</span>
            </div>

            {/* Profile */}
            <div className="relative z-[121]">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-all duration-200 border border-transparent hover:border-border"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-accent flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                  {getInitials(user?.fullname)}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-foreground">{user?.fullname || allocation?.name || 'Cửa hàng'}</span>
                <ChevronDown size={13} className="text-muted-foreground" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div {...dropdownMotion}
                    className="absolute top-full mt-2 right-0 w-56 bg-card border border-border rounded-xl shadow-lg py-1.5 z-[130]">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">{user?.fullname}</p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.1em]">{user?.role}</p>
                    </div>

                    {(user?.role === 'ADMIN' || user?.role === 'ADMIN_SUPER') && (
                      <Link to="/quan-ly-nguoi-dung" onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150">
                        <Users size={15} className="text-accent" />
                        <span>Quản lý truy cập</span>
                      </Link>
                    )}

                    <Link to="/settings" onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150">
                      <Settings size={15} className="text-muted-foreground" />
                      <span>Cài đặt</span>
                    </Link>

                    <div className="border-t border-border mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-colors duration-150">
                        <LogOut size={15} />
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
