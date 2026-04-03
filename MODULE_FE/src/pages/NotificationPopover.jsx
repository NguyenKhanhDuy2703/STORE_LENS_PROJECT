import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } from '@/redux/slices/notificationSlice';

const NotificationPopover = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get notifications from Redux store
  const notifications = useSelector(state => state.notifications.notifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationColor = (type) => {
    switch (type) {
      case 'critical':
        return 'border-l-rose-500 bg-rose-50';
      case 'warning':
        return 'border-l-amber-500 bg-amber-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-slate-300 bg-slate-50';
    }
  };

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition-all duration-200 group"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-md" />
        )}
      </button>

      {/* Notification Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            
            {/* Popover Panel */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-96"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Thông báo</h3>
                  {unreadCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500 font-medium">Không có thông báo nào</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map(notification => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 4 }}
                        className={`px-6 py-4 border-l-4 cursor-pointer transition-all hover:bg-slate-50 ${getNotificationColor(notification.type)}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold text-slate-900 truncate ${!notification.isRead ? 'font-bold' : ''}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                              {notification.description}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-2">{notification.time}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1.5 rounded-lg hover:bg-white transition-colors text-slate-400 hover:text-teal-600"
                                title="Đánh dấu đã đọc"
                              >
                                <CheckCheck size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1.5 rounded-lg hover:bg-white transition-colors text-slate-400 hover:text-rose-500"
                              title="Xóa"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex gap-2">
                  <button
                    onClick={() => dispatch(markAllAsRead())}
                    className="flex-1 text-center py-2 text-sm font-semibold text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                  <button
                    onClick={() => dispatch(clearAllNotifications())}
                    className="flex-1 text-center py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPopover;
