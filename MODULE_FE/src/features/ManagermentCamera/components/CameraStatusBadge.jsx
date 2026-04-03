const STATUS_CONFIG = {
  online: {
    label: 'Dang hoat dong',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-400',
  },
  offline: {
    label: 'Khong hoat dong',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    dotClass: 'bg-slate-400',
  },
  error: {
    label: 'Loi ket noi',
    className: 'bg-rose-50 text-rose-600 border-rose-200',
    dotClass: 'bg-rose-400',
  },
};

export const CameraStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.offline;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm font-medium tracking-tight ${config.className}`}>
      <span className={`h-3 w-3 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
};
