import { Sliders } from 'lucide-react';

const RightSidebar = ({
  opacity,
  setOpacity,
  heatRadius,
  setHeatRadius,
  intensityThreshold,
  setIntensityThreshold,
}) => {
  const SliderControl = ({ label, value, onChange, min, max, step, unit = '' }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-slate-600 tracking-tight">
          {label}
        </label>
        <span className="text-sm font-medium text-teal-600 tabular-nums tracking-tight">
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
        style={{
          background: `linear-gradient(to right, #cbd5e1 0%, #e2e8f0 ${(value - min) / (max - min) * 100}%, #e2e8f0 ${(value - min) / (max - min) * 100}%, #cbd5e1 100%)`
        }}
      />
      <div className="flex justify-between text-[10px] text-slate-400 tabular-nums tracking-tight">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
        <Sliders size={18} className="text-teal-600" />
        <h3 className="text-xs font-medium text-slate-900 tracking-tight">
          Cài Đặt
        </h3>
      </div>

      {/* Sliders Container */}
      <div className="space-y-6 flex-1">
        {/* Opacity Slider */}
        <SliderControl
          label="Độ Trong Suốt"
          value={opacity}
          onChange={setOpacity}
          min={0}
          max={100}
          step={5}
          unit="%"
        />

        {/* Heat Radius Slider */}
        <SliderControl
          label="Bán Kính Nhiệt"
          value={heatRadius}
          onChange={setHeatRadius}
          min={5}
          max={50}
          step={1}
          unit="px"
        />

        {/* Intensity Threshold Slider */}
        <SliderControl
          label="Mức Cường Độ"
          value={intensityThreshold}
          onChange={setIntensityThreshold}
          min={0}
          max={1}
          step={0.05}
          unit=""
        />
      </div>

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          <span className="font-medium text-slate-600">Mẹo:</span> Điều chỉnh các thanh trượt để tinh chỉnh trực quan hóa bản đồ nhiệt.
        </p>
      </div>
    </div>
  );
};

export default RightSidebar;
