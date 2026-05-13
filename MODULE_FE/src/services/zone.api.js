import axiosInstance from "./axios";
const API_BASE = "/zone";
export const getListZone = async ({ locationId, cameraCode }) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}`, {
      params: {
        locationId,
        cameraCode,
      },
    });
    console.log("API response for getListZone: ", response);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching list zones:", error);
    throw error;
  }
};
export const createAndUpdateZone = async ({
  locationId,
  cameraCode,
  listZones,
  imgUrl,
}) => {
  try {
    const response = await axiosInstance.post(`${API_BASE}`, {
      locationId,
      cameraCode,
      listZones,
      imgUrl,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating/updating zones:", error);
    throw error;
  }
};
export const deleteZone = async ({ locationId, cameraCode, zoneId }) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE}`, {
      data: {
        locationId,
        cameraCode,
        zoneId,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error deleting zone:", error);
    throw error;
  }
};
export const uploadZoneImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("url_img", file);
    const response = await axiosInstance.post(`${API_BASE}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data.imgUrl;
  } catch (error) {
    console.error("Error uploading zone image:", error);
    throw error;
  }
};
