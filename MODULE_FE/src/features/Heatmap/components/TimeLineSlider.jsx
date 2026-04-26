import React, { useMemo } from "react";
import useMeasure from "react-use-measure";
import dayjs from "dayjs";

const TimeLineSlider = ({ timeLine = [], activeIndex = 0, onFrameChange }) => {
  const [sliderRef, bounds] = useMeasure();

  const markers = useMemo(() => {
    if (!timeLine.length || bounds.width <= 0) return [];

    const total = timeLine.length;
    const maxLabels = Math.max(2, Math.floor(bounds.width / 75));
    const step = Math.max(1, Math.ceil((total - 1) / (maxLabels - 1)));

    return timeLine.map((ts, i) => {
      const isMajor = i === 0 || i === total - 1 || i % step === 0;
      return {
        index: i,
        xPos: total > 1 ? (i / (total - 1)) * bounds.width : 0,
        active: i <= activeIndex,
        isMajor,
        label: isMajor ? dayjs(ts).format("HH:mm:ss") : "",
      };
    });
  }, [timeLine, bounds.width, activeIndex]);

  if (!timeLine.length) return null;

  return (
    <div ref={sliderRef} className="flex-1 relative flex flex-col justify-end min-h-[60px] group">
      <div className="absolute inset-x-0 top-0 h-12 pointer-events-none">
        <svg width="100%" height="100%" className="overflow-visible">
          {markers.map((m) => (
            <g 
              key={m.index} 
              transform={`translate(${m.xPos}, 0)`}
              className="transition-all duration-300 ease-out"
            >
              {m.label && (
                <text 
                  x={0} y={0} 
                  textAnchor="middle" 
                  fill={m.active ? "#2dd4bf" : "#64748b"} 
                  fontSize="10" 
                  className="font-medium tabular-nums select-none"
                >
                  {m.label}
                </text>
              )}

              <line
                x1={0} y1={m.isMajor ? 8 : 12}
                x2={0} y2={18}
                stroke={m.active ? "#2dd4bf" : "#334155"}
                strokeWidth={m.isMajor ? 1.5 : 1}
              />


              <circle
                cx={0} cy={22}
                r={m.isMajor ? 3 : 1.5}
                fill={m.active ? "#2dd4bf" : "#334155"}
              />
            </g>
          ))}
        </svg>
      </div>

      <input
        type="range"
        min={0}
        max={timeLine.length - 1}
        value={activeIndex}
        onChange={(e) => onFrameChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500 relative z-10"
        style={{
          background: `linear-gradient(to right, #14b8a6 ${ (activeIndex / (timeLine.length - 1)) * 100 }%, #334155 0%)`
        }}
      />
    </div>
  );
};

export default React.memo(TimeLineSlider);