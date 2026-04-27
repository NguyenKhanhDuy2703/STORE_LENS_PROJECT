import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X, CheckCheck, AlertCircle, Info } from 'lucide-react';
import { fetchNotifications, readNotification } from '../../features/Notification/notification.thunk';

const NotificationPopover = () => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);

    const { data = [], unreadCount = 0, loading } = useSelector((state) => state.notification);
    // Lắng nghe locationId từ global filter — khi đổi location thì fetch lại
    const { locationId, userLocationId } = useSelector((state) => state.filter);

    // Fetch khi mở popover hoặc khi locationId thay đổi
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchNotifications());
        }
    }, [isOpen, locationId, userLocationId, dispatch]);

    const handleRead = (id) => {
        dispatch(readNotification(id));
    };

    // Chỉ hiển thị 10 thông báo gần nhất trong popover
    const previewList = data.slice(0, 10);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition-all duration-200"
            >
                <Bell size={20} />
                {/* Badge số chưa đọc */}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay để đóng khi click ngoài */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            className="absolute top-full mt-2 right-0 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            {/* Header popover */}
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <Bell size={16} className="text-teal-600" />
                                    <h3 className="font-bold text-slate-900 text-sm">Thông báo</h3>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-semibold rounded-full">
                                            {unreadCount} chưa đọc
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

                            {/* Danh sách thông báo */}
                            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
                                {loading && (
                                    <div className="px-5 py-6 text-center text-sm text-slate-400">
                                        Đang tải...
                                    </div>
                                )}

                                {!loading && previewList.length === 0 && (
                                    <div className="px-5 py-10 text-center">
                                        <Bell size={28} className="mx-auto text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-500">Không có thông báo nào</p>
                                    </div>
                                )}

                                {!loading && previewList.map((item) => (
                                    <div
                                        key={item._id}
                                        onClick={() => !item.is_read && handleRead(item._id)}
                                        className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors ${
                                            item.is_read
                                                ? 'bg-white hover:bg-slate-50'
                                                : 'bg-teal-50/40 hover:bg-teal-50'
                                        }`}
                                    >
                                        {/* Icon theo type */}
                                        <div className={`mt-0.5 shrink-0 p-1.5 rounded-lg ${
                                            item.title === 'ALERT'
                                                ? 'bg-rose-100 text-rose-500'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {item.title === 'ALERT'
                                                ? <AlertCircle size={14} />
                                                : <Info size={14} />
                                            }
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-snug ${item.is_read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                                                {item.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[11px] text-slate-400">
                                                    {new Date(item.created_at).toLocaleString('vi-VN')}
                                                </span>
                                                {!item.is_read && (
                                                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer — link xem tất cả */}
                            {data.length > 0 && (
                                <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50">
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            window.location.href = '/notification';
                                        }}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                                    >
                                        <CheckCheck size={13} />
                                        Xem tất cả thông báo
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
