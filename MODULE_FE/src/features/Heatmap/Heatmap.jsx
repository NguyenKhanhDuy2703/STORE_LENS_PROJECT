import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GlobalFilter } from '@/components/functionComponent/GlobalFilter';
import LeftSidebar from './components/LeftSidebar';
import HeatmapCanvas from './components/HeatMapContent';
import { fetchCameraWithZones, fetchMatrixHeatmap } from './heatmap.thunk';
import { clearHeatmapData } from './heatmap.slice';

const Heatmap = () => {
  const dispatch = useDispatch();
  const { currentHeatmap, infoHeatmapMatrix, timeLine, backgroundImage, isLoading, cameraList } = useSelector(
    (state) => state.heatmap || {}
  );
  const { locationId, userLocationId } = useSelector((state) => state.filter);

  // Display options state
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [zoneOverlay, setZoneOverlay] = useState(true);
 
  const [selectedCamera, setSelectedCamera] = useState('');

  const cameraOptions = Array.isArray(cameraList)
    ? cameraList.map((camera) => ({
        id: camera.camera_code,
        label: camera.camera_name || camera.camera_code,
      }))
    : [];

  const selectedCameraDetail = Array.isArray(cameraList)
    ? cameraList.find((camera) => camera.camera_code === selectedCamera)
    : null;

  const selectedCameraZones = Array.isArray(selectedCameraDetail?.zones)
    ? selectedCameraDetail.zones.map((zone) => {
        return {
          id: zone.zone_id,
          zoneId: zone.zone_id,
          zoneName: zone.zone_name,
          categoryName: zone.category_name,
          cameraCode: zone.camera_id,
          polygon_coordinates: zone.polygon_coordinates,
        };
    })
    : [];

  const frameZones = Array.isArray(currentHeatmap?.zones) ? currentHeatmap.zones : [];
  const displayZones = selectedCameraZones.length > 0 ? selectedCameraZones : frameZones;

  const displayHeatmap = currentHeatmap
    ? {
        ...currentHeatmap,
        zones: displayZones,
      }
    : null;

  const effectiveLocationId = locationId !== 'loc_all' ? locationId : userLocationId;

  useEffect(() => {
    if (!effectiveLocationId) {
      dispatch(clearHeatmapData());
      return;
    }

    dispatch(fetchCameraWithZones(effectiveLocationId));
  }, [dispatch, effectiveLocationId]);

  useEffect(() => {
    if (cameraOptions.length === 0) {
      setSelectedCamera('');
      return;
    }

    const hasSelectedCamera = cameraOptions.some((camera) => camera.id === selectedCamera);
    if (!hasSelectedCamera) {
      setSelectedCamera(cameraOptions[0].id);
    }
  }, [cameraOptions, selectedCamera]);

  useEffect(() => {
    if (!effectiveLocationId || !selectedCamera) {
      dispatch(clearHeatmapData());
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
            cameraOptions={cameraOptions}
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
              heatmapFrames={infoHeatmapMatrix}
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