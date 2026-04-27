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

/**
 * Normalize a single pixel point to a 0–1 ratio using the given reference dimensions.
 * @param {number} x - Pixel x coordinate
 * @param {number} y - Pixel y coordinate
 * @param {number} width - Reference width (original image/frame width)
 * @param {number} height - Reference height (original image/frame height)
 * @returns {{ x: number, y: number }} Normalized ratio in [0, 1]
 */
const normalizePoint = (x, y, width, height) => {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: roundNormalized(clamp(Number(x) / width, 0, 1)),
    y: roundNormalized(clamp(Number(y) / height, 0, 1)),
  };
};

/**
 * Denormalize a single 0–1 ratio point back to pixel coordinates using the given reference dimensions.
 * @param {number} ratioX - Normalized x ratio in [0, 1]
 * @param {number} ratioY - Normalized y ratio in [0, 1]
 * @param {number} width - Reference width (target display/frame width)
 * @param {number} height - Reference height (target display/frame height)
 * @returns {{ x: number, y: number }} Pixel coordinates
 */
const denormalizePoint = (ratioX, ratioY, width, height) => {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: roundPixel(clamp(Number(ratioX), 0, 1) * width),
    y: roundPixel(clamp(Number(ratioY), 0, 1) * height),
  };
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
  normalizePoint,
  denormalizePoint,
  getRelativePointer,
};
