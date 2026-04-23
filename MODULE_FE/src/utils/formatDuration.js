export const formatDuration = (value = 0, options = {}) => {
  const { input = 'seconds' } = options;
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? Math.max(numericValue, 0) : 0;
  const totalSeconds = input === 'milliseconds' ? Math.floor(safeValue / 1000) : Math.floor(safeValue);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

export default formatDuration;