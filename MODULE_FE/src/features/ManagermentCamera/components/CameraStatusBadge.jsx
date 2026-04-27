const STATUS_CONFIG = {
  active:     { label: 'Đang hoạt động', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500 animate-pulse-dot' },
  inactive:   { label: 'Không hoạt động', className: 'bg-muted text-muted-foreground border-border',     dotClass: 'bg-slate-400' },
  disconnect: { label: 'Mất kết nối',     className: 'bg-rose-50 text-rose-600 border-rose-200',         dotClass: 'bg-rose-500' },
  online:     { label: 'Đang hoạt động', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500 animate-pulse-dot' },
  offline:    { label: 'Không hoạt động', className: 'bg-muted text-muted-foreground border-border',     dotClass: 'bg-slate-400' },
  error:      { label: 'Lỗi kết nối',     className: 'bg-rose-50 text-rose-600 border-rose-200',         dotClass: 'bg-rose-500' },
};

export const CameraStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.offline;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] font-medium ${config.className}`}>
      <span className={`h-2 w-2 rounded-full shrink-0 ${config.dotClass}`} />
      {config.label}
    </span>
  );
};
