import { Pencil, Trash2, Layers } from 'lucide-react';

const ZonesList = ({ zones = [], onEdit, onDelete }) => {
  if (!zones || zones.length === 0) {
    return (
      <div className="py-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-2">
          <Layers size={22} className="text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Chưa có vùng nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
      {zones.map((zone, index) => {
        const points = zone?.coordinates?.length || zone?.polygon_coordinates?.length || 0;
        return (
          <div
            key={zone.zoneId ?? zone.zone_id ?? zone._id ?? index}
            className="p-3 bg-card rounded-xl border border-border hover:border-accent/40 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded shrink-0 border border-border"
                style={{ backgroundColor: zone?.color }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {zone?.zoneName || zone?.zone_name || 'Vùng chưa đặt tên'}
                </h3>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit?.(zone)}
                  className="p-1 hover:bg-accent/10 rounded transition-colors"
                  title="Chỉnh sửa vùng"
                >
                  <Pencil className="w-3.5 h-3.5 text-accent" />
                </button>
                <button
                  onClick={() => onDelete(zone.zoneId ?? zone.zone_id ?? zone._id)}
                  className="p-1 hover:bg-rose-50 rounded transition-colors"
                  title="Xóa vùng"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phân loại:</span>
                <span
                  className="px-1.5 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: zone?.color ? zone.color + '20' : 'transparent',
                    color: zone?.color || 'var(--color-foreground)',
                  }}
                >
                  {zone?.categoryName || zone?.category_name || 'Không xác định'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Điểm:</span>
                <span className="text-foreground font-mono tabular-nums">{points}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ZonesList;
