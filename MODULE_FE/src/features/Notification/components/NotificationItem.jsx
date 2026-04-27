import { Clock, MapPin, CheckCircle, AlertTriangle, Bell } from 'lucide-react';

const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// Badge type — hiển thị loại alert (ZONE, RETENTION, REVENUE...)
const TYPE_LABEL = {
    ZONE:      { label: "Khu vực",    className: "bg-amber-50 text-amber-700 border-amber-200" },
    RETENTION: { label: "Hội viên",   className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    REVENUE:   { label: "Doanh thu",  className: "bg-teal-50 text-teal-700 border-teal-200" },
};

const NotificationItem = ({ notification, onRead }) => {
    const { _id, title, type, message, created_at, is_read } = notification;

    const isAlert  = title === "ALERT";
    const typeInfo = TYPE_LABEL[type] || { label: type, className: "bg-muted text-muted-foreground border-border" };

    const handleReadClick = (e) => {
        e.stopPropagation();
        if (!is_read) onRead(_id);
    };

    return (
        <div
            className={`rounded-xl border p-4 transition-all ${
                !is_read
                    ? isAlert
                        ? "border-rose-200 bg-rose-50/60"
                        : "border-accent/30 bg-accent/5"
                    : "border-border bg-card"
            }`}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Icon theo loại */}
                    <div className={`mt-0.5 shrink-0 p-2 rounded-lg ${
                        isAlert ? "bg-rose-100 text-rose-600" : "bg-muted text-muted-foreground"
                    }`}>
                        {isAlert ? <AlertTriangle size={15} /> : <Bell size={15} />}
                    </div>

                    <div className="space-y-1 min-w-0">
                        {/* Type badge + location */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.1em] border ${typeInfo.className}`}>
                                {typeInfo.label}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <MapPin size={11} />
                                <span>{notification?.location_name || "Cửa hàng"}</span>
                            </span>
                        </div>

                        {/* Message */}
                        <p className={`leading-snug ${
                            !is_read ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}>
                            {message}
                        </p>
                    </div>
                </div>

                {/* Right: time + action */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                        <Clock size={11} />
                        {formatDate(created_at)}
                    </span>

                    {!is_read && (
                        <button
                            onClick={handleReadClick}
                            className={`flex items-center gap-1 font-medium px-2.5 py-1 rounded-lg transition-colors ${
                                isAlert
                                    ? "text-rose-600 hover:text-rose-700 bg-rose-100 hover:bg-rose-200"
                                    : "text-accent hover:text-accent bg-accent/10 hover:bg-accent/20"
                            }`}
                        >
                            <CheckCircle size={13} />
                            Đã đọc
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
