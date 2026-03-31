import { useState } from 'react';
import LeftSidebar from './components/LeftSidebar';
import HeatmapCanvas from './components/HeatMapContent';

const  Heatmap= () => {
  // 1. STATE QUẢN LÝ DỮ LIỆU LỌC (MOCK)
  const [selectedDate, setSelectedDate] = useState("2026-03-31");
  const [selectedStore, setSelectedStore] = useState("STORE001");
  const [selectedCamera, setSelectedCamera] = useState("C01");

  // 2. STATE ĐIỀU KHIỂN HIỂN THỊ (Kết nối Sidebar và Canvas)
  const [showGrid, setShowGrid] = useState(true);
  const [showZone, setShowZone] = useState(true);
  const [opacity, setOpacity] = useState(60);

  // 3. DỮ LIỆU GIẢ CHO TIMELINE VÀ MATRIX
  const mockTimeLine = ["09:00", "09:15", "09:30", "09:45", "10:00"];
  const isLoading = false; // Luôn tắt loading để hiện UI ngay

  const handleExport = () => {
    alert('Đang xuất báo cáo PNG cho cơ sở: ' + selectedStore);
  };

  const handleReset = () => {
    setSelectedDate("2026-03-31");
    setShowGrid(true);
    setShowZone(true);
    setOpacity(60);
    alert('Đã reset bộ lọc!');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="flex gap-6 h-[calc(100vh-120px)]">
        
        {/* Left Sidebar - Truyền State và hàm SetState xuống */}
        <div className="w-80 flex-shrink-0">
          <LeftSidebar 
            handleExport={handleExport}  
            handleReset={handleReset}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedStore={selectedStore}
            setSelectedStore={setSelectedStore}
            selectedCamera={selectedCamera}
            setSelectedCamera={setSelectedCamera}
            // Truyền logic hiển thị
            grid={showGrid}
            setGrid={setShowGrid}
            zone={showZone}
            setZone={setShowZone}
            opacity={opacity}
            setOpacity={setOpacity}
          />
        </div>

        {/* Center - Heatmap Canvas nhận dữ liệu hiển thị */}
        <div className="flex-1 min-w-0">
          <HeatmapCanvas 
            storeId={selectedStore} 
            cameraCode={selectedCamera} 
            isLoading={isLoading} 
            timeLine={mockTimeLine} 
            // Nhận các thông số hiển thị từ trang cha
            grid={showGrid}
            zone={showZone}
            opacity={opacity / 100} // Chuyển từ 0-100 sang 0-1
          />
        </div>
      </div>
    </div>
  );
};

export default Heatmap;