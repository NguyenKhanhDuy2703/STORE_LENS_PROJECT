import React from 'react';
import { Clock, MapPin, CheckCircle } from 'lucide-react';

const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const NotificationItem = ({ notification, onRead }) => {
    const {
        _id,
        location_id,
        title,
        message,
        created_at,
        is_read
    } = notification;

    const handleReadClick = (e) => {
        e.stopPropagation(); 
        if (!is_read) {
            onRead(_id);
        }
    };

    return (
        <div
            className={`bg-white rounded-xl border p-4 transition-all ${
                !is_read ? "border-blue-200 bg-blue-50" : "border-slate-200"
            }`}
        >
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400" />
                        <p className="font-semibold text-sm text-slate-900">
                            {location_id || "Không xác định vị trí"}
                        </p>
                    </div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-sm text-slate-500">{message}</p>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(created_at)}
                    </span>

                    {!is_read && (
                        <button
                            onClick={handleReadClick}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-100 px-2 py-1 rounded-lg transition-colors"
                        >
                            <CheckCircle size={14} />
                            Đánh dấu đã đọc
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;