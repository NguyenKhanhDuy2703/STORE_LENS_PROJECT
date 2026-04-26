import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "lucide-react";
import { fetchNotifications, readNotification } from "./notification.thunk";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import NotificationList from "./components/NotificationList";
import Pagination from "./components/Pagination";

const Notification = () => {
    const dispatch = useDispatch();
    const { data = [], loading = false, error = null } = useSelector(state => state.notification);

    const [activeTab, setActiveTab] = useState("normal");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const tabFiltered = useMemo(() => {
        return data.filter(n => {
            if (activeTab === "alert") return n.type === "ALERT";
            return n.type === "NORMAL";
        });
    }, [data, activeTab]);

    const searchedData = useMemo(() => {
        return tabFiltered.filter(n =>
            n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.location_id?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tabFiltered, searchQuery]);

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
            <div className="flex items-center justify-center h-screen">
                <Loader size={32} className="animate-spin text-slate-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-red-500">Lỗi: {error}</p>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-12">
            <Header
                searchQuery={searchQuery}
                setSearchQuery={(val) => {
                    setSearchQuery(val);
                    setCurrentPage(1);
                }}
            />

            <div className="max-full mx-auto px-4 py-8">
                <Tabs
                    activeTab={activeTab}
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
                        <div className="text-center py-20 text-slate-400">
                            <p>Không có thông báo</p>
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