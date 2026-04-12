// Format Unix timestamp (ms) to HH:mm:ss
  export const formatVietnamDateHour = (timestamp) => {
    if (!timestamp) return "00:00:00";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };