const Tabs = ({ activeTab, setActiveTab, unreadAlertCount = 0 }) => {
    const tabs = [
        { key: "normal", label: "Thông báo thường" },
        { key: "alert",  label: "Cảnh báo", badge: unreadAlertCount },
    ];

    return (
        <div className="flex items-center gap-6 border-b border-border">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex items-center gap-2 px-1 pb-4 text-sm font-semibold transition-all ${
                        activeTab === tab.key
                            ? "text-accent"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    {tab.label}

                    {/* Badge số alert chưa đọc */}
                    {tab.badge > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {tab.badge > 99 ? "99+" : tab.badge}
                        </span>
                    )}

                    {/* Active underline */}
                    {activeTab === tab.key && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
