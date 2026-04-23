import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MousePointer2 } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const [jumpPage, setJumpPage] = useState(currentPage);

    useEffect(() => {
        setJumpPage(currentPage);
    }, [currentPage]);

    if (totalPages <= 1) return null;

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^[0-9\b]+$/.test(value)) {
            setJumpPage(value);
        }
    };

    const handleJump = (e) => {
        if (e.key === 'Enter') {
            let page = parseInt(jumpPage);
            if (page >= 1 && page <= totalPages) {
                onPageChange(page);
            } else {
                setJumpPage(currentPage);
            }
        }
    };

    return (
        <div className="mt-10 flex flex-col items-center gap-3">
            <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="group relative p-2.5 rounded-xl transition-all enabled:hover:bg-teal-50 disabled:opacity-20"
                >
                    <ChevronLeft size={20} className="text-slate-600 group-enabled:group-hover:text-teal-600 transition-colors" strokeWidth={2.5} />
                </button>

                <div className="mx-2 flex items-center bg-slate-50/80 px-4 py-1.5 rounded-xl border border-slate-100 gap-3">
                    <div className="flex items-center gap-2">
            
                        <input
                            type="text"
                            value={jumpPage}
                            onChange={handleInputChange}
                            onKeyDown={handleJump}
                            className="w-10 h-8 text-center bg-white border border-slate-200 rounded-lg text-teal-600 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-inner"
                        />
                    </div>
                    
                    <span className="text-slate-300 font-light text-lg">/</span>
                    
                    <div className="flex items-center min-w-[1.5rem] justify-center">
                        <span className="text-sm font-black text-slate-700">{totalPages}</span>
                    </div>
                </div>

                <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="group relative p-2.5 rounded-xl transition-all enabled:hover:bg-teal-50 disabled:opacity-20"
                >
                    <ChevronRight size={20} className="text-slate-600 group-enabled:group-hover:text-teal-600 transition-colors" strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;