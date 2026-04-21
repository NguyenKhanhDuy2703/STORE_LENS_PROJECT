const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const roundNormalized = (value, precision = 6) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return Number(safeValue.toFixed(precision));
};

const roundPixel = (value) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return Math.round(safeValue);
};

const isValidContainerSize = (containerSize) => {
  const width = Number(containerSize?.width);
  const height = Number(containerSize?.height);
  return Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;
};

const normalizePoints = (points = [], containerSize) => {
  if (!Array.isArray(points) || !isValidContainerSize(containerSize)) {
    return [];
  }

  const width = Number(containerSize.width);
  const height = Number(containerSize.height);
  return points.map((point) => {
    const x = Number(point?.x ?? 0);
    const y = Number(point?.y ?? 0);

    const normalizedX = clamp(x / width, 0, 1);
    const normalizedY = clamp(y / height, 0, 1);
    return {
      x: roundNormalized(normalizedX),
      y: roundNormalized(normalizedY),
    };
  });
};

const denormalizePoints = (points = [], containerSize) => {
  if (!Array.isArray(points) || !isValidContainerSize(containerSize)) {
    return [];
  }

  const width = Number(containerSize.width);
  const height = Number(containerSize.height);
  return points.map((point) => {
    const x = clamp(Number(point?.x ?? 0), 0, 1);
    const y = clamp(Number(point?.y ?? 0), 0, 1);

    return {
      x: roundPixel(x * width),
      y: roundPixel(y * height),
    };
  });
};

const getNativePointer = (event) => {
  const nativeEvent = event?.nativeEvent || event;

  if (nativeEvent?.touches?.length) {
    return nativeEvent.touches[0];
  }

  if (nativeEvent?.changedTouches?.length) {
    return nativeEvent.changedTouches[0];
  }

  return nativeEvent;
};

const resolveContainerElement = (containerRef) => {
  if (!containerRef) return null;
  return containerRef.current || containerRef;
};

const getRelativePointer = (event, containerRef) => {
  const containerEl = resolveContainerElement(containerRef);
  const pointer = getNativePointer(event);

  if (!containerEl || !pointer || typeof pointer.clientX !== "number" || typeof pointer.clientY !== "number") {
    return { x: 0, y: 0 };
  }

  const rect = containerEl.getBoundingClientRect();
  const x = pointer.clientX - rect.left;
  const y = pointer.clientY - rect.top;


  return {
    x: roundPixel(clamp(x, 0, rect.width)),
    y: roundPixel(clamp(y, 0, rect.height)),
  };
};

export {
  normalizePoints,
  denormalizePoints,
  getRelativePointer,
};
