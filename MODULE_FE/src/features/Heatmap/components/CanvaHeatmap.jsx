import {
  Group,
  Line,
  Image as KonvaImage,
  Circle,
} from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { scaleSequential } from "d3-scale";
import { interpolateTurbo } from "d3-scale-chromatic";
import { useMemo, useRef, useEffect } from "react";
export const CameraImage = ({ src, width, height }) => {
  const [image] = useImage(src, "anonymous");
  return image ? (
    <KonvaImage image={image} width={width} height={height} />
  ) : null;
};

export const HeatmapGrid = ({
  matrix,
  frameWidth,
  frameHeight,
  opacity,
  heatRadius = 24,
  blurRadius = 70,
}) => {
  const groupRef = useRef(null);
  const rows = matrix?.length || 0;
  const cols = matrix?.[0]?.length || 0;
  const cellWidth = cols > 0 ? frameWidth / cols : 0;
  const cellHeight = rows > 0 ? frameHeight / rows : 0;

  const colorScale = useMemo(() => {
    if (!matrix || matrix.length === 0) return null;
    const flatValues = matrix.flat();
    const minValue = Math.min(...flatValues);
    const maxValue = Math.max(...flatValues);

    if (minValue === maxValue) return () => "rgba(0,0,255,0)";
    return scaleSequential(interpolateTurbo).domain([minValue, maxValue]);
  }, [matrix]);

  useEffect(() => {
    const node = groupRef.current;
    if (
      node &&
      typeof node.cache === "function" &&
      frameWidth > 0 &&
      frameHeight > 0
    ) {
      const padding = 30;
      try {
        node.cache({
          x: -padding,
          y: -padding,
          width: frameWidth + padding * 2,
          height: frameHeight + padding * 2,
          pixelRatio: 2,
        });
      } catch (e) {
        console.warn("Konva caching failed:", e);
      }
    }
  }, [matrix, frameWidth, frameHeight, opacity, blurRadius]);

  if (!matrix || matrix.length === 0 || !colorScale) return null;

  return (
    <Group
      ref={groupRef}
      filters={[Konva.Filters.Blur]}
      blurRadius={blurRadius}
      globalCompositeOperation="screen"
    >
      {matrix.map((row, rowIdx) =>
        row.map((value, colIdx) => {
          if (value === 0) return null;

          const x = colIdx * cellWidth + cellWidth / 2;
          const y = rowIdx * cellHeight + cellHeight / 2;
          const radius = Math.max(heatRadius, Math.min(cellWidth, cellHeight) * 0.55);
          const fillColor = colorScale(value);

          return (
            <Circle
              key={`heat-${rowIdx}-${colIdx}`}
              x={x}
              y={y}
              radius={radius}
              fill={fillColor}
              opacity={Math.max(0.08, opacity)}
              shadowBlur={24}
              shadowColor={fillColor}
            />
          );
        })
      )}
    </Group>
  );
};

// Component vẽ grid lines
export const GridLines = ({ gridSize, frameWidth, frameHeight }) => {
  const lines = [];

  // Vertical lines
  for (let x = 0; x <= frameWidth; x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, frameHeight]}
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth={1}
      />
    );
  }

  // Horizontal lines
  for (let y = 0; y <= frameHeight; y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, frameWidth, y]}
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth={1}
      />
    );
  }

  return <Group>{lines}</Group>;
};
