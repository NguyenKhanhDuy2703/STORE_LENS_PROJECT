import React from 'react';

const Tabs = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex items-center gap-6 border-b border-slate-200 mb-6">

            {[
                { key: 'normal', label: 'Thông báo thường' },
                { key: 'alert', label: 'Cảnh báo' }
            ].map(tab => (
                <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative px-1 pb-4 text-sm font-semibold transition-all ${activeTab === tab.key
                            ? 'text-teal-600'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    {tab.label}

                    {/* ACTIVE LINE */}
                    {activeTab === tab.key && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-teal-600 rounded-full" />
                    )}
                </button>
            ))}

        </div>
    );
};

export default Tabs;