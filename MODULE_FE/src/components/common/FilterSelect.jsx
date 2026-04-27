import { ChevronDown } from 'lucide-react';

/**
 * FilterSelect — dropdown select dùng chung toàn app
 *
 * Props:
 *   label     : string — label hiển thị trên select
 *   value     : string
 *   onChange  : (value: string) => void
 *   options   : Array<{ value: string, label: string }>
 *   disabled  : boolean (optional)
 *   className : string (optional)
 */
const FilterSelect = ({ label, value, onChange, options = [], disabled = false, className = '' }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground whitespace-nowrap">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full h-10 appearance-none bg-card border border-border rounded-xl px-3.5 pr-9 text-sm text-foreground outline-none cursor-pointer hover:border-accent/40 transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15 ${
            disabled ? 'bg-muted cursor-not-allowed opacity-60' : ''
          }`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
      </div>
    </div>
  );
};

export default FilterSelect;
