import { useMemo } from "react";

const parseCoordinates = (coordinates) => {
  if (!coordinates) return [];
  if (typeof coordinates === "string") {
    try {
      const parsed = JSON.parse(coordinates);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (!Array.isArray(coordinates)) return [];
  return coordinates.flatMap((item) => {
    if (Array.isArray(item)) {
      return item;
    }
    if (item && typeof item === "object") {
      return [item.x ?? 0, item.y ?? 0];
    }
    return [item];
  });
};

const normalizePoints = (coordinates, imageSize) => {
  const raw = parseCoordinates(coordinates);
  const displayPoints = [];

  for (let i = 0; i < raw.length; i += 2) {
    const rawX = Number(raw[i] ?? 0);
    const rawY = Number(raw[i + 1] ?? 0);
    const x = imageSize ? rawX * imageSize.width : rawX;
    const y = imageSize ? rawY * imageSize.height : rawY;
    displayPoints.push(x, y);
  }

  return displayPoints;
};

const absolutePoints = (coordinates) => {
  const raw = parseCoordinates(coordinates);
  return raw.map((value) => Math.floor(Number(value ?? 0)));
};

const isNormalized = (coordinates) => {
  const raw = parseCoordinates(coordinates);
  if (raw.length === 0) return false;
  return raw.every((value) => typeof value === "number" && value >= 0 && value <= 1);
};

const getCoordinates = (zone) => zone.coordinates ?? zone.polygon_coordinates ?? [];

export const useZoneTransform = ({
  zones = [],
  coordinateMode = "auto",
  imageSize,
}) => {
  return useMemo(() => {
    if (!Array.isArray(zones)) return [];

    return zones.map((zone) => {
      const sourceCoords = getCoordinates(zone);
      const zoneMode =
        coordinateMode === "auto"
          ? isNormalized(sourceCoords)
            ? "normalized"
            : "absolute"
          : coordinateMode;
      const displayPoints =
        zoneMode === "normalized"
          ? normalizePoints(sourceCoords, imageSize)
          : absolutePoints(sourceCoords);

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (let i = 0; i < displayPoints.length; i += 2) {
        const x = displayPoints[i];
        const y = displayPoints[i + 1];
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }

      const centerX = Number.isFinite(minX) ? (minX + maxX) / 2 : 0;
      const centerY = Number.isFinite(minY) ? (minY + maxY) / 2 : 0;

      return {
        ...zone,
        displayPoints,
        centerX,
        centerY,
      };
    });
  }, [zones, coordinateMode, imageSize]);
};
