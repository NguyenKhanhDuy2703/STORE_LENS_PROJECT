import { Pencil, Trash2, Layers } from 'lucide-react';

const ZonesList = ({ zones = [], onEdit, onDelete }) => {
  if (!zones || zones.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full mb-4 border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
          <Layers size={28} className="text-emerald-500" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Chưa có vùng nào</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Hãy vẽ vùng trên ảnh camera để quản lý không gian</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-300px)] pr-1 custom-scrollbar">
      {zones.map((zone, index) => {
        const points = zone?.coordinates?.length || zone?.polygon_coordinates?.length || 0;
        return (
          <div
            key={zone.zoneId ?? zone.zone_id ?? zone._id ?? index}
            className="p-4 bg-background rounded-xl border border-border hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-200 group hover:shadow-md hover:shadow-emerald-500/5 relative overflow-hidden"
          >
            {/* Background Hint for Color */}
            <div 
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: zone?.color || '#10B981' }}
            ></div>

            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-5 h-5 rounded-md shrink-0 border border-border/50 shadow-sm mt-0.5"
                style={{ backgroundColor: zone?.color || '#10B981' }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate text-[15px]">
                  {zone?.zoneName || zone?.zone_name || 'Vùng chưa đặt tên'}
                </h3>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit?.(zone)}
                  className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors text-emerald-600 dark:text-emerald-400"
                  title="Chỉnh sửa vùng"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(zone.zoneId ?? zone.zone_id ?? zone._id)}
                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors text-rose-500"
                  title="Xóa vùng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 bg-muted/40 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Phân loại:</span>
                <span
                  className="px-2 py-0.5 rounded-md text-xs font-semibold"
                  style={{
                    backgroundColor: zone?.color ? zone.color + '15' : 'transparent',
                    color: zone?.color || 'var(--color-foreground)',
                  }}
                >
                  {zone?.categoryName || zone?.category_name || 'Không xác định'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Điểm neo:</span>
                <span className="text-xs font-bold text-foreground tabular-nums px-2 py-0.5 bg-background rounded-md border border-border/50 shadow-sm">
                  {points} pts
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ZonesList;
