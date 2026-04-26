import axiosInstance from "./axios";
const BASE_URL = "/dwell-time";
const getDwellTimeMetrics = async ({ locationId, date }) => {
  try {
    const response = await axiosInstance.get(
      `${BASE_URL}/metrics/${locationId}`,
      {
        params: { date },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching dwell time metrics:", error);
    throw error;
  }
};
const getPerformanceInteract = async ({ locationId, date }) => {
  try {
    const response = await axiosInstance.get(
      `${BASE_URL}/performance-interact/${locationId}`,
      {
        params: { date },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching performance interact:", error);
    throw error;
  }
};
const getAnalysisDwellTime = async ({ locationId, date }) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/analysis`, {
      params: { locationId, date },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching analysis dwell time:", error);
    throw error;
  }
};
export default {
  getDwellTimeMetrics,
  getPerformanceInteract,
  getAnalysisDwellTime,
};
