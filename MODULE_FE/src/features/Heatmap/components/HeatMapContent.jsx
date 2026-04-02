import { useState, useRef, useEffect } from "react";
import { Layer, Rect, Group, Stage } from "react-konva";
import { SkipBack, SkipForward, ZoomIn, ZoomOut } from "lucide-react";
import {
  CameraImage,
  DrawingPoints,
  GridLines,
  HeatmapGrid,
  ZoneShape,
} from "./CanvaHeatmap";

const HeatmapCanvas = ({ storeId = "STORE_001", cameraCode = "CAM_01", isLoading = false }) => {
  // 1. DỮ LIỆU GIẢ (MOCK DATA)
  const mockTimeLine = ["09:00", "09:15", "09:30", "09:45", "10:00"];
  
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
        color: "rgba(20, 184, 166, 0.3)"
      }
    ]
  };

  // 2. LOCAL STATE QUẢN LÝ UI (Thay thế Redux)
  const [zoom, setZoom] = useState(0.8);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [statusCurrent] = useState({
    grid: true,
    zone: true,
    opacity: 0.6
  });
  const [dimensions, setDimensions] = useState({ width: 1280, height: 720 });
  const containerRef = useRef(null);

  const { grid, zone, opacity } = statusCurrent;
  const currentHeatmap = [mockHeatmapData]; 
  const totalFrames = mockTimeLine.length;
  const startTimeLine = mockTimeLine[0];
  const endTimeLine = mockTimeLine[mockTimeLine.length - 1];

  const onChangeFrame = (value) => {
    if (value >= 0 && value < totalFrames) {
      setCurrentFrame(value);
      console.log("Chuyển khung giờ demo:", mockTimeLine[value]);
    }
  };

  const frameWidth = currentHeatmap[0].frameWidth;
  const frameHeight = currentHeatmap[0].frameHeight;

  // Xử lý Responsive cho Canvas
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        setDimensions({
          width: container.clientWidth - 32,
          height: container.clientHeight - 32,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // 3. THAY THẾ COMPONENT LOADING BẰNG DIV CƠ BẢN
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        <span className="ml-3 text-slate-500 font-medium">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                Camera {cameraCode}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {storeId} • Khung giờ: {mockTimeLine[currentFrame]} • 20/11/2026
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <div>Độ phân giải: <span className="text-slate-700">{frameWidth}×{frameHeight}</span></div>
              <div>Lưới: <span className="text-slate-700">{currentHeatmap[0].gridSize}px</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-slate-900 flex items-center justify-center p-4 relative"
      >
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
            <HeatmapGrid
              matrix={currentHeatmap[0].heatmapMatrix}
              gridSize={currentHeatmap[0].gridSize}
              frameWidth={frameWidth}
              frameHeight={frameHeight}
              opacity={opacity}
            />
            {zone && currentHeatmap[0].zones.map((z, idx) => (
              <Group key={idx}>
                <ZoneShape zone={z} />
                <DrawingPoints points={z.coordinates} />
              </Group>
            ))}
            {grid && (
              <GridLines
                gridSize={currentHeatmap[0].gridSize}
                frameWidth={frameWidth}
                frameHeight={frameHeight}
              />
            )}
            <Rect width={frameWidth} height={frameHeight} fill="black" opacity={0.2} />
          </Layer>
        </Stage>
      </div>

      {/* Toolbar & Timeline */}
      <div className="px-5 py-4 bg-white border-t border-slate-100 space-y-4">
        {/* Color Scale */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Mật độ:</span>
          <div className="flex-1 h-2 rounded-full" style={{ background: "linear-gradient(to right, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000)" }} />
          <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
            <span>Thấp</span>
            <span>Cao</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <button
              onClick={() => onChangeFrame(currentFrame - 1)}
              className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 disabled:opacity-30"
              disabled={currentFrame === 0}
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={() => onChangeFrame(currentFrame + 1)}
              className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 disabled:opacity-30"
              disabled={currentFrame === totalFrames - 1}
            >
              <SkipForward size={16} />
            </button>
          </div>

          <div className="flex-1 flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{startTimeLine}</span>
            <input
              type="range"
              min={0}
              max={totalFrames - 1}
              value={currentFrame}
              onChange={(e) => onChangeFrame(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{endTimeLine}</span>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <button onClick={() => setZoom(Math.max(0.3, zoom - 0.1))} className="p-1.5 hover:bg-slate-100 rounded border border-slate-200"><ZoomOut size={14} /></button>
            <span className="text-[11px] font-mono text-slate-600 w-10 text-center">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-1.5 hover:bg-slate-100 rounded border border-slate-200"><ZoomIn size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapCanvas;