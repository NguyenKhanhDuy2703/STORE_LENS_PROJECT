import React from 'react';
import { Search } from 'lucide-react';

const Header = ({ searchQuery, setSearchQuery }) => {
    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="w-full px-6 lg:px-10 py-4">

                {/* FULL WIDTH SEARCH */}
                <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                        <Search size={18} />
                    </span>

                    <input
                        type="text"
                        className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-transparent rounded-xl text-sm
        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white
        hover:bg-slate-200 transition-all"
                        placeholder="Tìm kiếm thông báo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

            </div>
        </header>
    );
};

export default Header;