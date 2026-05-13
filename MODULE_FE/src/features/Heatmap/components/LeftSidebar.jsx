import { Eye, Layers, Calendar } from 'lucide-react';

const LeftSidebar = ({
  cameraOptions = [],
  heatmapVisible,
  setHeatmapVisible,
  zoneOverlay,
  setZoneOverlay,
  selectedCamera,
  setSelectedCamera,
  selectedDate,
  setSelectedDate,
}) => {

  const ToggleButton = ({ icon: Icon, label, isActive, onChange }) => (
    <button
      onClick={() => onChange(!isActive)}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all duration-200 font-semibold text-sm shadow-sm active:scale-[0.98] ${
        isActive
          ? 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
          : 'bg-background border-border text-muted-foreground hover:border-blue-300 hover:bg-blue-50/50'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon size={18} className={isActive ? "text-blue-600 dark:text-blue-400" : ""} />
        <span>{label}</span>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        isActive ? 'bg-blue-500 border-blue-500 shadow-inner' : 'border-border bg-background'
      }`}>
        {isActive && (
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col overflow-y-auto custom-scrollbar shadow-sm">
      {/* Date Selector */}
      <div className="mb-6 pb-5 border-b border-border">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Calendar size={14} /> Chọn Ngày
        </label>
        <input
          type="date"
          value={selectedDate || ''}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]} // Chỉ cho phép chọn tới ngày hiện tại
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
        />
      </div>

      {/* Camera Selector */}
      <div className="mb-6 pb-5 border-b border-border">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
          Chọn Camera
        </label>
        <div className="space-y-2">
          {cameraOptions.map((cam) => (
            <button
              key={cam.id}
              onClick={() => setSelectedCamera(cam.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold shadow-sm active:scale-[0.98] ${
                selectedCamera === cam.id
                  ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/20'
                  : 'bg-background border-border text-foreground hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-500/10'
              }`}
            >
              {cam.label}
            </button>
          ))}
          {cameraOptions.length === 0 && (
            <div className="p-3 bg-muted rounded-lg border border-border text-sm text-muted-foreground text-center">
              Chưa có camera cho cơ sở này.
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <Eye size={18} className="text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-bold text-foreground tracking-tight uppercase">
          Chế độ hiển thị
        </h3>
      </div>

      {/* Display Toggles */}
      <div className="space-y-3 mb-6">
        <ToggleButton
          icon={Eye}
          label="Bản Đồ Nhiệt"
          isActive={heatmapVisible}
          onChange={setHeatmapVisible}
        />

        <ToggleButton
          icon={Layers}
          label="Khu Vực Phân Tích"
          isActive={zoneOverlay}
          onChange={setZoneOverlay}
        />
      </div>


      {/* Footer Info */}
      <div className="mt-auto pt-4 border-t border-border">
        <p className="text-[11px] text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-lg border border-border/50">
          Chọn ngày và camera ở phía trên để xem dữ liệu bản đồ nhiệt tương ứng.
        </p>
      </div>
    </div>
  );
};

export default LeftSidebar;