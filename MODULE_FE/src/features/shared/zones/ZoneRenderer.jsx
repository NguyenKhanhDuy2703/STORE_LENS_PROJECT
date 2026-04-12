import { useMemo } from "react";
import { Group, Line, Rect, Circle, Text } from "react-konva";
import { useZoneTransform } from "./useZoneTransform";

const DEFAULT_STYLE = {
  fillOpacity: 0.18,
  strokeWidth: 3,
  strokeColor: "#3B82F6",
  labelBackground: "rgba(0,0,0,0.65)",
  labelColor: "#FFFFFF",
  anchorFill: "#2dd4bf",
  anchorStroke: "#0f766e",
  anchorRadius: 4,
};

const ZoneRenderer = ({
  zones = [],
  coordinateMode = "absolute",
  imageSize,
  showLabels = false,
  showHandles = false,
  isEditing = false,
  onAnchorDrag,
}) => {
  const normalizedZones = useZoneTransform({
    zones,
    coordinateMode,
    imageSize,
  });

  const zoneElements = useMemo(
    () =>
      normalizedZones.map((zone, idx) => {
        if (!Array.isArray(zone.displayPoints) || zone.displayPoints.length < 6) {
          return null;
        }

        const labelText = zone.zoneName || zone.zone_name || zone.name || "Zone";
        const typeText = zone.categoryName || zone.category_name || zone.type || "";
        const strokeColor = zone.color || "#3B82F6";
        const fillColor = `${strokeColor}22`;
        const combinedText = typeText ? `${labelText} · ${typeText}` : labelText;
        const labelWidth = 120;
        const labelHeight = 34;
        const labelX = zone.centerX - labelWidth / 2;
        const labelY = zone.centerY - labelHeight / 2;

        return (
          <Group key={zone.id ?? zone.zoneId ?? idx} visible={zone.visible !== false}>
            <Line
              points={zone.displayPoints}
              closed
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={DEFAULT_STYLE.strokeWidth}
              lineJoin="round"
            />

            {showLabels && (
              <>
                <Rect
                  x={labelX}
                  y={labelY}
                  width={labelWidth}
                  height={labelHeight}
                  fill={DEFAULT_STYLE.labelBackground}
                  cornerRadius={6}
                />
                <Text
                  x={labelX + 8}
                  y={labelY + 6}
                  text={combinedText}
                  fontSize={12}
                  fill={DEFAULT_STYLE.labelColor}
                  width={labelWidth - 16}
                  height={labelHeight - 12}
                  align="left"
                />
              </>
            )}

            {showHandles && zone.displayPoints.map((_, pointIndex) => {
              const x = zone.displayPoints[pointIndex * 2];
              const y = zone.displayPoints[pointIndex * 2 + 1];
              return (
                <Circle
                  key={`anchor-${idx}-${pointIndex}`}
                  x={x}
                  y={y}
                  radius={DEFAULT_STYLE.anchorRadius}
                  fill={DEFAULT_STYLE.anchorFill}
                  stroke={DEFAULT_STYLE.anchorStroke}
                  strokeWidth={2}
                  draggable={Boolean(isEditing && onAnchorDrag)}
                  onDragMove={(e) => {
                    if (!onAnchorDrag) return;
                    onAnchorDrag(idx, pointIndex, { x: e.target.x(), y: e.target.y() });
                  }}
                />
              );
            })}
          </Group>
        );
      }),
    [normalizedZones, showLabels, showHandles, isEditing, onAnchorDrag]
  );

  return <>{zoneElements}</>;
};

export default ZoneRenderer;
