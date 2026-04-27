import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "lucide-react";
import { fetchNotifications, readNotification } from "./notification.thunk";
import { addRealtimeAlert } from "./notification.slice";
import socket from "../../services/socket";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import NotificationList from "./components/NotificationList";
import Pagination from "../../components/common/Pagination";

const Notification = () => {
    const dispatch = useDispatch();
    const { data = [], loading = false, error = null } = useSelector((state) => state.notification);
    const { locationId, userLocationId } = useSelector((state) => state.filter);
    const effectiveLocationId = locationId !== "loc_all" ? locationId : userLocationId;

    const [activeTab, setActiveTab] = useState("normal");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch khi vào trang — chỉ fetch nếu chưa có data hoặc locationId thay đổi
    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch, effectiveLocationId]);

    // Lắng nghe socket new_alert — thêm vào danh sách ngay lập tức
    useEffect(() => {
        if (!effectiveLocationId) return;

        if (!socket.connected) socket.connect();
        socket.emit("join_location", effectiveLocationId);

        const handleNewAlert = (notification) => {
            dispatch(addRealtimeAlert(notification));
            // Tự động chuyển sang tab cảnh báo khi có alert mới
            setActiveTab("alert");
        };

        socket.on("new_alert", handleNewAlert);

        return () => {
            socket.off("new_alert", handleNewAlert);
        };
    }, [dispatch, effectiveLocationId]);

    // Filter theo tab — dùng title để phân loại mức độ
    const tabFiltered = useMemo(() => {
        return data.filter((n) => {
            if (activeTab === "alert")  return n.title === "ALERT";
            return n.title === "NORMAL";
        });
    }, [data, activeTab]);

    const searchedData = useMemo(() => {
        return tabFiltered.filter((n) =>
            n.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.type?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tabFiltered, searchQuery]);

    // Đếm số alert chưa đọc để hiển thị badge trên tab
    const unreadAlertCount = useMemo(
        () => data.filter((n) => n.title === "ALERT" && !n.is_read).length,
        [data]
    );

    const totalPages = Math.ceil(searchedData.length / itemsPerPage);

    const paginatedData = useMemo(() => {
        return searchedData.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [searchedData, currentPage]);

    const handleRead = (id) => {
        dispatch(readNotification(id));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader size={28} className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-rose-500">Lỗi: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            <Header
                searchQuery={searchQuery}
                setSearchQuery={(val) => {
                    setSearchQuery(val);
                    setCurrentPage(1);
                }}
            />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <Tabs
                    activeTab={activeTab}
                    unreadAlertCount={unreadAlertCount}
                    setActiveTab={(tab) => {
                        setActiveTab(tab);
                        setCurrentPage(1);
                    }}
                />

                <div className="mt-6">
                    <NotificationList
                        data={paginatedData}
                        onRead={handleRead}
                    />

                    {searchedData.length === 0 && (
                        <div className="text-center py-20 text-muted-foreground">
                            <p>{activeTab === "alert" ? "Không có cảnh báo nào" : "Không có thông báo nào"}</p>
                        </div>
                    )}
                </div>

                {searchedData.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
};

export default Notification;
