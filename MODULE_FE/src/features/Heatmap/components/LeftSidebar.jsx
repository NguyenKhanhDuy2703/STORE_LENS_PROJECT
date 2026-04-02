import { useState } from "react";
import { Download, RotateCcw, Filter, Eye } from "lucide-react";

const LeftSidebar = ({
  selectedDate,
  setSelectedDate,
  selectedStore,
  setSelectedStore,
  selectedCamera,
  setSelectedCamera,
  handleExport,
  handleReset,
}) => {
  // 1. THAY THẾ REDUX BẰNG LOCAL STATE
  const [grid, setGrid] = useState(true);
  const [zone, setZone] = useState(true);
  const [opacity, setOpacity] = useState(60);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Section: Bộ lọc */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2">
            <Filter size={16} className="text-teal-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Bộ lọc dữ liệu</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Ngày phân tích</label>
              <input
                type="date"
                value={selectedDate || today}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Cơ sở / Cửa hàng</label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none cursor-pointer"
              >
                <option value="STORE001">Cơ sở Quận 1 (Chính)</option>
                <option value="STORE002">Cơ sở Quận 7</option>
                <option value="STORE003">Cơ sở Đà Nẵng</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Nguồn Camera</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none cursor-pointer"
              >
                <option value="C01">Camera 01 - Cửa chính</option>
                <option value="C02">Camera 02 - Khu vực tạ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section: Tùy chọn hiển thị */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2">
            <Eye size={16} className="text-blue-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Tùy chọn hiển thị</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group">
              <span className="text-sm font-medium text-slate-700">Ranh giới khu vực</span>
              <input
                type="checkbox"
                checked={zone}
                onChange={(e) => setZone(e.target.checked)}
                className="w-5 h-5 accent-teal-500 rounded cursor-pointer transition-transform group-active:scale-90"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group">
              <span className="text-sm font-medium text-slate-700">Lưới tọa độ (Grid)</span>
              <input
                type="checkbox"
                checked={grid}
                onChange={(e) => setGrid(e.target.checked)}
                className="w-5 h-5 accent-teal-500 rounded cursor-pointer transition-transform group-active:scale-90"
              />
            </label>

            <div className="space-y-3 px-1 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Độ mờ Heatmap</label>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  {opacity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-2">
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all shadow-md shadow-teal-100 font-bold text-sm active:scale-95"
        >
          <Download size={18} />
          Xuất dữ liệu PNG
        </button>
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition-all font-bold text-sm active:scale-95"
        >
          <RotateCcw size={18} />
          Làm mới bộ lọc
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;