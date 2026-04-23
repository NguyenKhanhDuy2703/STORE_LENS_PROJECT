import axiosInstance from "./axios";
import { getCameraDashboardData } from "./camera.api";

const BASE_URL = "/area-management";

export const getAreaManagementKPIs = async ({ locationId, type, cameraId, zoneId }) => {
  try {
    const params = { locationId, type };
    if (cameraId) params.cameraId = cameraId;
    if (zoneId) params.zoneId = zoneId;

    const response = await axiosInstance.get(`${BASE_URL}/kpis`, { params });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch area management KPIs: ${response.statusText}`);
    }

    return response.data.data;
  } catch (error) {
    console.error("Error fetching area management KPIs:", error);
    throw error;
  }
};

export const getAreaManagementHourlyTraffic = async ({ locationId, type, cameraId, zoneId }) => {
  try {
    const params = { locationId, type };
    if (cameraId) params.cameraId = cameraId;
    if (zoneId) params.zoneId = zoneId;

    const response = await axiosInstance.get(`${BASE_URL}/hourly-traffic`, { params });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch hourly traffic: ${response.statusText}`);
    }

    return response.data.data;
  } catch (error) {
    console.error("Error fetching hourly traffic:", error);
    throw error;
  }
};

export const getAreaManagementPerformanceDetails = async ({ locationId, type, cameraId, zoneId }) => {
  try {
    const params = { locationId, type };
    if (cameraId) params.cameraId = cameraId;
    if (zoneId) params.zoneId = zoneId;

    const response = await axiosInstance.get(`${BASE_URL}/performance-details`, { params });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch performance details: ${response.statusText}`);
    }

    return response.data.data;
  } catch (error) {
    console.error("Error fetching performance details:", error);
    throw error;
  }
};
