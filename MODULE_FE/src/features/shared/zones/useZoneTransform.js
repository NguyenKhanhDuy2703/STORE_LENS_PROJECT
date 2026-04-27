import { useMemo } from "react";

const parseCoordinates = (coordinates) => {
  if (!coordinates) return [];

  if (typeof coordinates === "string") {
    try {
      const parsed = JSON.parse(coordinates);
      if (!Array.isArray(parsed)) return [];
      return parseCoordinates(parsed);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(coordinates) || coordinates.length === 0) return [];

  return coordinates.flatMap((item) => {
    if (Array.isArray(item)) {
      if (item.length > 0 && Array.isArray(item[0])) return parseCoordinates(item);
      return item.map((v) => Number(v) || 0);
    }
    if (item && typeof item === "object") {
      return [Number(item.x ?? 0), Number(item.y ?? 0)];
    }
    return [Number(item) || 0];
  });
};

const normalizePoints = (coordinates, imageSize) => {
  const raw = parseCoordinates(coordinates);
  const displayPoints = [];
  const hasValidSize = imageSize && imageSize.width > 0 && imageSize.height > 0;

  for (let i = 0; i < raw.length; i += 2) {
    const rawX = Number(raw[i] ?? 0);
    const rawY = Number(raw[i + 1] ?? 0);
    displayPoints.push(
      hasValidSize ? rawX * imageSize.width : rawX,
      hasValidSize ? rawY * imageSize.height : rawY,
    );
  }

  return displayPoints;
};

const absolutePoints = (coordinates) => {
  const raw = parseCoordinates(coordinates);
  return raw.map((value) => Math.floor(Number(value ?? 0)));
};

const isNormalized = (coordinates) => {
  const raw = parseCoordinates(coordinates);
  return (
    raw.length >= 6 &&
    raw.every((value) => typeof value === "number" && value >= 0 && value <= 1)
  );
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
