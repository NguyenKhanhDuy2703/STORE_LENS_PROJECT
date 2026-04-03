import { Eye, Layers } from 'lucide-react';

const cameras = [
  { id: 'C01', label: 'Camera 01 - Cửa chính' },
  { id: 'C02', label: 'Camera 02 - Khu vực tạ' },
  { id: 'C03', label: 'Camera 03 - Quầy thanh toán' },
];

const LeftSidebar = ({
  heatmapVisible,
  setHeatmapVisible,
  zoneOverlay,
  setZoneOverlay,
  paletteType,
  setPaletteType,
  selectedCamera,
  setSelectedCamera,
}) => {
  const paletteOptions = [
    { value: 'turbo', label: 'Turbo', preview: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-red-600' },
    { value: 'viridis', label: 'Viridis', preview: 'bg-gradient-to-r from-purple-900 via-green-500 to-yellow-300' },
    { value: 'plasma', label: 'Plasma', preview: 'bg-gradient-to-r from-purple-900 via-pink-500 to-yellow-300' },
  ];

  const ToggleButton = ({ icon: Icon, label, isActive, onChange }) => (
    <button
      onClick={() => onChange(!isActive)}
      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border-2 transition-all font-medium text-sm ${
        isActive
          ? 'bg-teal-50 border-teal-600 text-teal-700'
          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
        isActive ? 'bg-teal-600 border-teal-600' : 'border-slate-300 bg-white'
      }`}>
        {isActive && (
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 h-full flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
      {/* Camera Selector */}
      <div className="mb-5 pb-4 border-b border-slate-200">
        <label className="text-xs font-medium text-slate-600 tracking-tight mb-2.5 block">
          Camera
        </label>
        <div className="space-y-1.5">
          {cameras.map((cam) => (
            <button
              key={cam.id}
              onClick={() => setSelectedCamera(cam.id)}
              className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-all text-xs font-medium ${
                selectedCamera === cam.id
                  ? 'bg-teal-50 border-teal-600 text-teal-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {cam.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-200">
        <Eye size={16} className="text-teal-600" />
        <h3 className="text-xs font-medium text-slate-900 tracking-tight">
          Hiển Thị
        </h3>
      </div>

      {/* Display Toggles */}
      <div className="space-y-2.5 mb-5">
        <ToggleButton
          icon={Eye}
          label="Bản Đồ Nhiệt"
          isActive={heatmapVisible}
          onChange={setHeatmapVisible}
        />

        <ToggleButton
          icon={Layers}
          label="Khu Vực"
          isActive={zoneOverlay}
          onChange={setZoneOverlay}
        />
      </div>

      {/* Palette Selection */}
      <div className="pt-4 border-t border-slate-200">
        <label className="text-xs font-medium text-slate-600 tracking-tight mb-2.5 block">
          Bảng Màu
        </label>
        
        <div className="space-y-1.5">
          {paletteOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setPaletteType(option.value)}
              className={`w-full p-2.5 rounded-lg border-2 transition-all text-xs ${
                paletteType === option.value
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-4 rounded-md ${option.preview}`}></div>
                <span className={`font-medium ${
                  paletteType === option.value ? 'text-teal-700' : 'text-slate-600'
                }`}>
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-3 border-t border-slate-200">
        <p className="text-[9px] text-slate-500 leading-relaxed">
          Dùng <strong>GlobalFilter</strong> để chọn cơ sở, camera và ngày phân tích.
        </p>
      </div>
    </div>
  );
};

export default LeftSidebar;