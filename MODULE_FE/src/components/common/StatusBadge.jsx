/**
 * StatusBadge — dùng chung toàn app
 *
 * Props:
 *   status : string — giá trị trạng thái
 *   type   : "camera" | "member" | "user" | "product" — loại entity (optional, default: "generic")
 *
 * Tự động map status → label + màu theo type
 */

// Map cho camera status
const CAMERA_STATUS = {
  active:     { label: 'Đang hoạt động', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500 animate-pulse-dot' },
  online:     { label: 'Đang hoạt động', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500 animate-pulse-dot' },
  inactive:   { label: 'Không hoạt động', className: 'bg-muted text-muted-foreground border-border',     dot: 'bg-slate-400' },
  offline:    { label: 'Không hoạt động', className: 'bg-muted text-muted-foreground border-border',     dot: 'bg-slate-400' },
  disconnect: { label: 'Mất kết nối',     className: 'bg-rose-50 text-rose-600 border-rose-200',         dot: 'bg-rose-500' },
  error:      { label: 'Lỗi kết nối',     className: 'bg-rose-50 text-rose-600 border-rose-200',         dot: 'bg-rose-500' },
};

// Map cho member/customer status
const MEMBER_STATUS = {
  active:   { label: 'Đang hoạt động', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  ACTIVE:   { label: 'Đang hoạt động', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  inactive: { label: 'Không hoạt động', className: 'bg-muted text-muted-foreground border-border',     dot: 'bg-slate-400' },
  INACTIVE: { label: 'Không hoạt động', className: 'bg-muted text-muted-foreground border-border',     dot: 'bg-slate-400' },
};

// Map cho user role
const USER_ROLE = {
  superadmin: { label: 'SuperAdmin', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  admin:      { label: 'Admin',      className: 'bg-purple-50 text-purple-700 border-purple-200' },
  manager:    { label: 'Manager',    className: 'bg-blue-50 text-blue-700 border-blue-200' },
  staff:      { label: 'Staff',      className: 'bg-muted text-muted-foreground border-border' },
};

// Map cho product status
const PRODUCT_STATUS = {
  true:  { label: '✓ Đang bán', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  false: { label: '⊗ Ngưng',    className: 'bg-muted text-muted-foreground border-border' },
};

const TYPE_MAP = {
  camera:  CAMERA_STATUS,
  member:  MEMBER_STATUS,
  user:    USER_ROLE,
  product: PRODUCT_STATUS,
};

const FALLBACK = { label: 'Không xác định', className: 'bg-muted text-muted-foreground border-border', dot: 'bg-slate-400' };

const StatusBadge = ({ status, type = 'generic', showDot = false }) => {
  const map = TYPE_MAP[type] || {};
  const config = map[String(status)] || FALLBACK;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium ${config.className} ${
      type === 'camera' ? 'font-mono text-[11px] uppercase tracking-[0.1em]' : 'text-xs'
    }`}>
      {(showDot || type === 'camera') && config.dot && (
        <span className={`h-2 w-2 rounded-full shrink-0 ${config.dot}`} />
      )}
      {config.label}
    </span>
  );
};

export default StatusBadge;
