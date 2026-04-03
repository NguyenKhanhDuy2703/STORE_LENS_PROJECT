import { useState } from 'react';
import { GlobalFilter } from '@/components/functionComponent/GlobalFilter';
import LeftSidebar from './components/LeftSidebar';
import HeatmapCanvas from './components/HeatMapContent';

const Heatmap = () => {
  // Display options state
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [zoneOverlay, setZoneOverlay] = useState(true);
  const [paletteType, setPaletteType] = useState('turbo');
  const [selectedCamera, setSelectedCamera] = useState('C01');

  // Mock data for canvas
  const mockTimeLine = ['09:00', '09:15', '09:30', '09:45', '10:00'];
  const isLoading = false;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Global Filter */}
      <GlobalFilter />

      {/* Main Layout: Left Sidebar + Heatmap Canvas */}
      <div className="flex-1 flex gap-6 p-6 max-w-[1760px] mx-auto w-full">
        {/* LEFT SIDEBAR: Fixed width (250px) - Display toggles only */}
        <div className="w-[250px] flex-shrink-0">
          <LeftSidebar
            selectedCamera={selectedCamera}
            setSelectedCamera={setSelectedCamera}
            heatmapVisible={heatmapVisible}
            setHeatmapVisible={setHeatmapVisible}
            zoneOverlay={zoneOverlay}
            setZoneOverlay={setZoneOverlay}
            paletteType={paletteType}
            setPaletteType={setPaletteType}
          />
        </div>

        {/* MAIN CANVAS: Flex-1 (fills remaining space) */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 h-full shadow-sm overflow-hidden">
            <HeatmapCanvas
              cameraCode={selectedCamera}
              isLoading={isLoading}
              timeLine={mockTimeLine}
              heatmapVisible={heatmapVisible}
              zoneOverlay={zoneOverlay}
              opacity={0.8}
              paletteType={paletteType}
              heatRadius={15}
              intensityThreshold={0.2}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;