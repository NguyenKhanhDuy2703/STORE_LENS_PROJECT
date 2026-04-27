import axiosInstance from "./axios";
const BASE_URL = "/camera";
export const getCameraDashboardData = async (locationId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}`, {
      params: { locationId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getCameraAndZoneInfo = async (locationId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/camera-zone-info`, {
      params: { locationId },
    });
    return response.data?.data || [];
  } catch (error) {
    throw error;
  }
};

export const upsertCamera = async (cameraCode, cameraData) => {
  try {
    const isUpdate = Boolean(cameraCode);
    const payload = isUpdate
      ? { ...cameraData, camera_code: cameraCode }
      : cameraData;
    const response = isUpdate
      ? await axiosInstance.put(`${BASE_URL}/${cameraCode}`, payload)
      : await axiosInstance.post(`${BASE_URL}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCamera = async (cameraCode) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/${cameraCode}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
// Bật module phân tích AI cho camera
export const turnOnCamera = async ({ cameraCode, urlRtsp, locationId }) => {
  const response = await axiosInstance.post(`${BASE_URL}/turn-on`, {
    cameraCode,
    urlRtsp,
    locationId,
  });
  return response.data;
};

// Tắt module phân tích AI cho camera
export const turnOffCamera = async (urlRtsp) => {
  const response = await axiosInstance.get(`${BASE_URL}/turn-off`, {
    params: { urlRtsp },
  });
  return response.data;
};
export const getCameraWithZonesByLocationId = async (locationId) => {
  try {
    const response = await axiosInstance.get(
      `${BASE_URL}/camera-zones-by-allcation`,
      {
        params: { locationId },
      },
    );
    return response.data?.data || [];
  } catch (error) {
    throw error;
  }
};
