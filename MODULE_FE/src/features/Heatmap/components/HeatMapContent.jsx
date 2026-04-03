import { useState, useRef, useEffect } from "react";
import { Layer, Stage, Group } from "react-konva";
import { SkipBack, SkipForward, ZoomIn, ZoomOut, EyeOff } from "lucide-react";
import {
  CameraImage,
  DrawingPoints,
  GridLines,
  HeatmapGrid,
  ZoneShape,
} from "./CanvaHeatmap";

const HeatmapCanvas = ({
  isLoading = false,
  timeLine = [],
  heatmapVisible = true,
  zoneOverlay = true,
  opacity = 0.8,
  heatRadius = 15,
}) => {
  // Mock data
  const generateMockMatrix = (rows, cols) => {
    return Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => Math.floor(Math.random() * 100))
    );
  };

  const mockHeatmapData = {
    backgroundImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1280&auto=format&fit=crop",
    frameWidth: 1280,
    frameHeight: 720,
    gridSize: 40,
    heatmapMatrix: generateMockMatrix(18, 32),
    zones: [
      {
        zoneName: "Khu vực máy chạy",
        coordinates: [
          { x: 100, y: 100 }, { x: 400, y: 100 }, { x: 400, y: 400 }, { x: 100, y: 400 }
        ],
        color: "rgba(13, 148, 136, 0.3)"
      }
    ]
  };

  // State for canvas controls
  const [zoom, setZoom] = useState(0.8);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 1280, height: 720 });
  const containerRef = useRef(null);

  const currentHeatmap = [mockHeatmapData];
  const totalFrames = timeLine.length > 0 ? timeLine.length : 5;
  const startTimeLine = timeLine[0] || "09:00";
  const endTimeLine = timeLine[timeLine.length - 1] || "10:00";

  const onChangeFrame = (value) => {
    if (value >= 0 && value < totalFrames) {
      setCurrentFrame(value);
    }
  };

  const frameWidth = currentHeatmap[0].frameWidth;
  const frameHeight = currentHeatmap[0].frameHeight;

  // Responsive canvas
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        setDimensions({
          width: container.clientWidth - 16,
          height: container.clientHeight - 16,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
        <span className="text-slate-500 font-medium text-sm">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Canvas Area - Priority */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-slate-900 flex items-center justify-center p-2 relative"
      >
        {heatmapVisible ? (
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            scaleX={zoom}
            scaleY={zoom}
          >
            <Layer>
              <CameraImage
                src={currentHeatmap[0].backgroundImage}
                width={frameWidth}
                height={frameHeight}
              />
              {heatmapVisible && (
                <HeatmapGrid
                  matrix={currentHeatmap[0].heatmapMatrix}
                  gridSize={heatRadius}
                  frameWidth={frameWidth}
                  frameHeight={frameHeight}
                  opacity={opacity}
                />
              )}
              {zoneOverlay && currentHeatmap[0].zones.map((z, idx) => (
                <Group key={idx}>
                  <ZoneShape zone={z} />
                  <DrawingPoints points={z.coordinates} />
                </Group>
              ))}
              <GridLines
                gridSize={currentHeatmap[0].gridSize}
                frameWidth={frameWidth}
                frameHeight={frameHeight}
              />
            </Layer>
          </Stage>
        ) : (
          <div className="text-center flex flex-col items-center justify-center h-full gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
              <EyeOff className="text-slate-400" size={24} />
            </div>
            <p className="text-slate-400 text-sm font-medium">Bản đồ nhiệt đã tắt</p>
            <p className="text-slate-500 text-xs">Bật nó lên từ bảng điều khiển bên trái</p>
          </div>
        )}
      </div>

      {/* Controls at Bottom */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-3 space-y-3">
        {/* Color Scale Legend */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-medium text-slate-400 tracking-tight whitespace-nowrap">Cường Độ:</span>
          <div className="flex-1 h-2 rounded-full" style={{ background: "linear-gradient(to right, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000)" }} />
          <span className="text-[10px] text-slate-400 tracking-tight">Thấp → Cao</span>
        </div>

        {/* Timeline Controls */}
        <div className="flex items-center gap-4">
          {/* Frame Navigation */}
          <div className="flex gap-1">
            <button
              onClick={() => onChangeFrame(currentFrame - 1)}
              disabled={currentFrame === 0}
              className="p-1.5 hover:bg-slate-700 rounded border border-slate-600 disabled:opacity-30 transition-colors text-slate-300 hover:text-slate-100"
              title="Khung trước"
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={() => onChangeFrame(currentFrame + 1)}
              disabled={currentFrame === totalFrames - 1}
              className="p-1.5 hover:bg-slate-700 rounded border border-slate-600 disabled:opacity-30 transition-colors text-slate-300 hover:text-slate-100"
              title="Khung sau"
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Timeline Slider */}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-[10px] font-medium text-slate-400 bg-slate-700 px-2 py-1 rounded whitespace-nowrap tracking-tight tabular-nums">
              {startTimeLine}
            </span>
            <input
              type="range"
              min={0}
              max={totalFrames - 1}
              value={currentFrame}
              onChange={(e) => onChangeFrame(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <span className="text-[10px] font-medium text-slate-400 bg-slate-700 px-2 py-1 rounded whitespace-nowrap tracking-tight tabular-nums">
              {endTimeLine}
            </span>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 border-l border-slate-600 pl-4">
            <button
              onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
              className="p-1.5 hover:bg-slate-700 rounded border border-slate-600 transition-colors text-slate-300 hover:text-slate-100"
              title="Thu nhỏ"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-[10px] font-medium text-slate-400 w-10 text-center tracking-tight tabular-nums">
              {(zoom * 100).toFixed(0)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-1.5 hover:bg-slate-700 rounded border border-slate-600 transition-colors text-slate-300 hover:text-slate-100"
              title="Phóng to"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapCanvas;