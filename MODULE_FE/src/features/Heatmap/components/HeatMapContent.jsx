import { useState, useMemo } from "react";
import { Layer, Stage, Group } from "react-konva";
import { SkipBack, SkipForward, ZoomIn, ZoomOut, EyeOff } from "lucide-react";
import useMeasure from "react-use-measure";
import { CameraImage, HeatmapGrid, GridLines } from "./CanvaHeatmap";
import TimeLineSlider from "./TimeLineSlider";
import ZoneRenderer from "../../shared/zones/ZoneRenderer";

const HeatmapCanvas = ({
  currentHeatmap,
  heatmapFrames = [],
  backgroundImage = "",
  timeLine = [],
  isLoading = false,
  heatmapVisible = true,
  zoneOverlay = true,
  opacity = 0.8,
  heatRadius = 15,
  onFrameChange,
}) => {
  const [zoom, setZoom] = useState(1);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);

  const [stageRef, stageBounds] = useMeasure();
  const [timelineRef, timelineBounds] = useMeasure();

  // --- [CỤM 2]: XỬ LÝ DỮ LIỆU FRAME ---
  const frames = useMemo(() => (Array.isArray(heatmapFrames) ? heatmapFrames : []), [heatmapFrames]);
  const activeIndex = Math.min(currentFrameIdx, Math.max(0, frames.length - 1));
  const activeData = useMemo(() => {
    const frame = frames[activeIndex] || currentHeatmap;
    if (!frame) return null;

    const fallbackZones = Array.isArray(currentHeatmap?.zones) ? currentHeatmap.zones : [];
    const zones = Array.isArray(frame.zones) && frame.zones.length > 0 ? frame.zones : fallbackZones;

    return {
      ...frame,
      zones,
    };
  }, [frames, activeIndex, currentHeatmap]);
  const cameraImageSrc = activeData?.backgroundImage || backgroundImage || "";

  // --- [CỤM 3]: LOGIC HÌNH HỌC (STAGE GEOMETRY) ---
  const frameWidth = activeData?.frameWidth || 1280;
  const frameHeight = activeData?.frameHeight || 720;

  // Khống chế kích thước Stage (Trừ buffer 10px để tránh Loop)
  const finalWidth = useMemo(() => Math.floor((stageBounds.width || 0) - 10), [stageBounds.width]);
  const finalHeight = useMemo(() => Math.floor((stageBounds.height || 0) - 10), [stageBounds.height]);

  // Tính tỉ lệ Zoom-to-fit
  const stageScale = useMemo(() => {
    if (finalWidth <= 0 || finalHeight <= 0) return zoom;
    const fitScale = Math.min(finalWidth / frameWidth, finalHeight / frameHeight, 1);
    return fitScale * zoom;
  }, [finalWidth, finalHeight, frameWidth, frameHeight, zoom]);

  const stageCenter = useMemo(() => {
    const centeringX = (finalWidth - frameWidth * stageScale) / 2;
    const centeringY = (finalHeight - frameHeight * stageScale) / 2;
    return {
      x: Math.max(0, Math.floor(centeringX)),
      y: Math.max(0, Math.floor(centeringY)),
    };
  }, [finalWidth, finalHeight, frameWidth, frameHeight, stageScale]);


  const handleSliderChange = (idx) => {
    setCurrentFrameIdx(idx);
    if (onFrameChange && timeLine[idx]) onFrameChange(timeLine[idx]);
  };

  if (isLoading) return <div className="h-full flex items-center justify-center text-slate-400 font-medium">Đang tải dữ liệu...</div>;

  return (
    <div className="h-full flex flex-col bg-slate-900 overflow-hidden select-none">
      
      <div ref={stageRef} className="flex-1 w-full min-h-0 relative overflow-hidden bg-slate-950">
        {activeData && finalWidth > 0 && finalHeight > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Stage width={finalWidth} height={finalHeight}>
              <Layer x={stageCenter.x} y={stageCenter.y} scaleX={stageScale} scaleY={stageScale}>
                <CameraImage src={cameraImageSrc} width={frameWidth} height={frameHeight} />

                <Group name="heatmap-layer" visible={heatmapVisible}>
                  <HeatmapGrid 
                    matrix={activeData.heatmapMatrix} 
                    frameWidth={frameWidth} 
                    frameHeight={frameHeight} 
                    opacity={opacity} 
                    heatRadius={heatRadius} 
                  />
                </Group>

                <Group name="zone-layer" visible={zoneOverlay}>
                  <GridLines gridSize={activeData.gridSize} frameWidth={frameWidth} frameHeight={frameHeight} />
                  <ZoneRenderer
                    zones={activeData.zones || []}
                    coordinateMode="auto"
                    imageSize={{ width: frameWidth, height: frameHeight }}
                    showLabels={true}
                    showHandles={false}
                  />
                </Group>
              </Layer>
            </Stage>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <EyeOff size={48} />
            <span>Không tìm thấy dữ liệu camera</span>
          </div>
        )}
      </div>

      {/* VÙNG ĐIỀU KHIỂN (CONTROLS BAR) */}
      <div className="bg-slate-800 border-t border-slate-700 p-4 space-y-4 shadow-2xl z-20">
        <div className="flex items-center gap-6">
          
          {/* Nút Skip Nav */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button onClick={() => handleSliderChange(activeIndex - 1)} disabled={activeIndex === 0} className="p-2 hover:bg-slate-700 disabled:opacity-20 text-slate-300">
              <SkipBack size={18} />
            </button>
            <button onClick={() => handleSliderChange(activeIndex + 1)} disabled={activeIndex === timeLine.length - 1} className="p-2 hover:bg-slate-700 disabled:opacity-20 text-slate-300">
              <SkipForward size={18} />
            </button>
          </div>

          {/* TÍCH HỢP TIMELINE SLIDER TÁCH BIỆT */}
          <div ref={timelineRef} className="flex-1">
            <TimeLineSlider 
              timeLine={timeLine} 
              activeIndex={activeIndex} 
              onFrameChange={handleSliderChange}
              width={timelineBounds.width} 
            />
          </div>

          {/* Cụm Zoom */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
            <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="text-slate-400 hover:text-white transition-colors"><ZoomOut size={16}/></button>
            <span className="text-[10px] font-bold text-slate-300 w-10 text-center tabular-nums">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="text-slate-400 hover:text-white transition-colors"><ZoomIn size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapCanvas;