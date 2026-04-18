import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GlobalFilter } from '@/components/functionComponent/GlobalFilter';
import LeftSidebar from './components/LeftSidebar';
import HeatmapCanvas from './components/HeatMapContent';
import { fetchMatrixHeatmap } from './heatmap.thunk';

const Heatmap = () => {
  const dispatch = useDispatch();
  const { currentHeatmap, infoHeatmapMatrix, timeLine, backgroundImage, loading: isLoading } = useSelector(
    (state) => state.heatmap || {}
  );
  const { locationId, userLocationId } = useSelector((state) => state.filter);

  // Display options state
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [zoneOverlay, setZoneOverlay] = useState(true);
 
  const [selectedCamera, setSelectedCamera] = useState('CAM_FRONT_057601');

  const mockZones = [
    {
      zoneId: "zone_1",
      zoneName: "Lối vào chính",
      categoryName: "Khu vực vào",
      color: "#22c55e",
      coordinates: [
        [120, 80],
        [520, 80],
        [520, 260],
        [120, 260],
      ],
    },
    {
      zoneId: "zone_2",
      zoneName: "Quầy lễ tân",
      categoryName: "Khu vực dịch vụ",
      color: "#fb7185",
      coordinates: [
        [700, 90],
        [1120, 90],
        [1120, 280],
        [700, 280],
      ],
    },
    {
      zoneId: "zone_3",
      zoneName: "Lối đi giữa",
      categoryName: "Lưu thông",
      color: "#38bdf8",
      coordinates: [
        [260, 340],
        [970, 340],
        [970, 520],
        [260, 520],
      ],
    },
  ];

  const mockHeatmap = {
    cameraCode: selectedCamera,
    timeStamp: "mocked-zone",
    heatmapMatrix: [],
    gridSize: 16,
    frameWidth: 1280,
    frameHeight: 720,
    widthMatrix: 80,
    heightMatrix: 45,
    zones: mockZones,
    backgroundImage: backgroundImage,
  };

  const displayHeatmap = currentHeatmap
    ? {
        ...currentHeatmap,
        zones: Array.isArray(currentHeatmap.zones) && currentHeatmap.zones.length > 0 ? currentHeatmap.zones : mockZones,
      }
    : mockHeatmap;

  const effectiveLocationId = locationId !== 'loc_all' ? locationId : userLocationId;

  useEffect(() => {
    if (!effectiveLocationId) {
      return;
    }

    dispatch(
      fetchMatrixHeatmap({
        locationId: effectiveLocationId,
        cameraId: selectedCamera,
        date: new Date().toISOString().split('T')[0],
      })
    );
  }, [dispatch, selectedCamera, effectiveLocationId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Global Filter */}
      <GlobalFilter />

      {/* Main Layout: Left Sidebar + Heatmap Canvas */}
      <div className="flex-1 flex gap-6 p-6 max-w-[1760px] mx-auto w-full">
      
        <div className="w-[250px] shrink-0">
          <LeftSidebar
            selectedCamera={selectedCamera}
            setSelectedCamera={setSelectedCamera}
            heatmapVisible={heatmapVisible}
            setHeatmapVisible={setHeatmapVisible}
            zoneOverlay={zoneOverlay}
            setZoneOverlay={setZoneOverlay}
            
          />
        </div>

  
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 h-full shadow-sm overflow-hidden">
            <HeatmapCanvas
              cameraCode={selectedCamera}
              currentHeatmap={displayHeatmap}
              heatmapFrames={infoHeatmapMatrix.length > 0 ? infoHeatmapMatrix : [mockHeatmap]}
              backgroundImage={backgroundImage}
              timeLine={timeLine}
              isLoading={isLoading}
              heatmapVisible={heatmapVisible}
              zoneOverlay={zoneOverlay}
              opacity={0.8}
              heatRadius={15}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;