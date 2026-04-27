import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination — dùng chung toàn app
 *
 * Props:
 *   currentPage  : số trang hiện tại (1-based)
 *   totalPages   : tổng số trang
 *   onPageChange : callback(page: number)
 *   totalItems   : (optional) tổng số item — hiển thị "X-Y / Z"
 *   pageSize     : (optional) số item mỗi trang — dùng khi có totalItems
 */
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, pageSize }) => {
  const [jumpPage, setJumpPage] = useState(currentPage);

  useEffect(() => {
    setJumpPage(currentPage);
  }, [currentPage]);

  if (totalPages <= 1) return null;

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^[0-9]+$/.test(val)) setJumpPage(val);
  };

  const handleJump = (e) => {
    if (e.key === 'Enter') {
      const page = parseInt(jumpPage);
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      } else {
        setJumpPage(currentPage);
      }
    }
  };

  const showItemRange = totalItems != null && pageSize != null;
  const rangeStart = showItemRange ? (currentPage - 1) * pageSize + 1 : null;
  const rangeEnd   = showItemRange ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      {/* Item range info */}
      {showItemRange && (
        <p className="text-muted-foreground tabular-nums">
          Hiển thị{' '}
          <span className="font-medium text-accent">{rangeStart}–{rangeEnd}</span>
          {' / '}
          <span className="font-medium">{totalItems}</span>
        </p>
      )}

      {/* Page controls */}
      <div className="flex items-center bg-card border border-border rounded-2xl p-1 shadow-sm gap-1 ml-auto">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-xl transition-all hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Trang trước"
        >
          <ChevronLeft size={18} className="text-foreground" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-xl border border-border">
          <input
            type="text"
            value={jumpPage}
            onChange={handleInputChange}
            onKeyDown={handleJump}
            className="w-9 h-7 text-center bg-card border border-border rounded-lg text-accent font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            aria-label="Nhập số trang"
          />
          <span className="text-muted-foreground">/</span>
          <span className="font-bold text-foreground min-w-[1.25rem] text-center">{totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl transition-all hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Trang sau"
        >
          <ChevronRight size={18} className="text-foreground" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
