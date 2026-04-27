import axiosInstance from "./axios";

const BASE_URL = "/async";

// Đồng bộ LocationStats cho một location
export const syncLocationStats = async (locationId) => {
    const response = await axiosInstance.get(`${BASE_URL}/stats/${locationId}`);
    return response.data;
};

// Đồng bộ ZoneStats cho một zone cụ thể
export const syncZoneStats = async (locationId, zoneId, cameraCode) => {
    const params = cameraCode ? { cameraCode } : {};
    const response = await axiosInstance.get(`${BASE_URL}/stats/${locationId}/${zoneId}`, { params });
    return response.data;
};
