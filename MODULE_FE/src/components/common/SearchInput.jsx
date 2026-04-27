import { Search, X } from 'lucide-react';

/**
 * SearchInput — thanh tìm kiếm dùng chung toàn app
 *
 * Props:
 *   value       : string
 *   onChange    : (value: string) => void
 *   placeholder : string (optional)
 *   className   : string (optional) — override wrapper class
 */
const SearchInput = ({ value, onChange, placeholder = 'Tìm kiếm...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-9 rounded-xl border border-border bg-muted/50 text-sm text-foreground outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15 placeholder:text-muted-foreground/50"
      />
      {/* Nút xóa khi có giá trị */}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Xóa tìm kiếm"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
