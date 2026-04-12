import { useCallback, useMemo, useState } from "react";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const convertStageToImageCoords = ({ stageX, stageY, stageScale = 1, stageCenter = { x: 0, y: 0 } }) => {
  const imageX = (stageX - stageCenter.x) / stageScale;
  const imageY = (stageY - stageCenter.y) / stageScale;
  return { x: imageX, y: imageY };
};

const normalizeImagePoint = ({ x, y, imageSize }) => {
  if (!imageSize || imageSize.width === 0 || imageSize.height === 0) {
    return { x, y };
  }
  return {
    x: clamp(x, 0, imageSize.width),
    y: clamp(y, 0, imageSize.height),
  };
};

export const useZoneDrawing = ({ initialPoints = [], imageSize, stageScale = 1, stageCenter = { x: 0, y: 0 } } = {}) => {
  const [currentPoints, setCurrentPoints] = useState(initialPoints);

  const imagePoints = useMemo(() => {
    if (!Array.isArray(currentPoints)) return [];
    return currentPoints.flat().map((value) => Number(value) || 0);
  }, [currentPoints]);

  const addPointFromStage = useCallback(
    ({ stageX, stageY }) => {
      const rawPoint = convertStageToImageCoords({ stageX, stageY, stageScale, stageCenter });
      const clampedPoint = normalizeImagePoint({ x: rawPoint.x, y: rawPoint.y, imageSize });
      setCurrentPoints((prev) => [...prev, clampedPoint.x, clampedPoint.y]);
    },
    [imageSize, stageScale, stageCenter]
  );

  const removeLastPoint = useCallback(() => {
    setCurrentPoints((prev) => prev.slice(0, Math.max(0, prev.length - 2)));
  }, []);

  const resetPoints = useCallback(() => {
    setCurrentPoints([]);
  }, []);

  const getPointPairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < imagePoints.length; i += 2) {
      pairs.push([imagePoints[i], imagePoints[i + 1]]);
    }
    return pairs;
  }, [imagePoints]);

  const toRawImagePoint = useCallback(
    ({ stageX, stageY }) => {
      const rawPoint = convertStageToImageCoords({ stageX, stageY, stageScale, stageCenter });
      return normalizeImagePoint({ x: rawPoint.x, y: rawPoint.y, imageSize });
    },
    [imageSize, stageScale, stageCenter]
  );

  return {
    currentPoints: imagePoints,
    pointPairs: getPointPairs,
    addPointFromStage,
    removeLastPoint,
    resetPoints,
    setCurrentPoints,
    toRawImagePoint,
  };
};
