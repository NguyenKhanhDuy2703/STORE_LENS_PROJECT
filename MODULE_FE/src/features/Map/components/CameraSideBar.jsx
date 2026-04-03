import { Camera } from "lucide-react";
// Presentational-only sidebar for mock/local state mode
const CameraSidebar = ({ cameras = [], zones = [], selectedCameraCode, onSelectCamera }) => {

   

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 h-full">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
        <h2 className="text-lg font-semibold tracking-tight text-slate-800">Danh sách camera</h2>
        <button
          onClick={() => alert("Chức năng thêm camera chưa được triển khai")}
          className="bg-purple-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-purple-700 transition-colors"
        >
          + Thêm
        </button>
      </div>
      <div className="space-y-2.5">
        {cameras.length > 0 ? (
          cameras.map((cam) => {
            const isSelected = selectedCameraCode === cam.cameraCode;
            const camZones = zones.find((zone) => zone.cameraCode === cam.cameraCode) || { zones: [], backgroundImage: null };
            return (
              <div
                key={cam.cameraCode}
                onClick={() => onSelectCamera?.(cam)}
                className={`p-3 rounded-md cursor-pointer border transition-all ${
                  isSelected
                    ? "border-purple-500 bg-purple-50"
                    : "border-slate-200 hover:border-purple-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-md">
                      <Camera size={16} className="text-purple-600" />
                    </div>
                    <span className="font-medium tracking-tight text-slate-800">{cam.cameraName}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100">
                  <span className="px-2 py-1 rounded-md font-medium bg-green-50 text-green-700">
                    {camZones.backgroundImage ? "Đã setup hình nền" : "Chưa setup hình nền"}
                  </span>
                  <span className="text-slate-600 font-medium tracking-tight tabular-nums">{camZones.zones.length} zones</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-3">
              <Camera size={28} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 font-medium tracking-tight">Chưa có camera nào</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default CameraSidebar;