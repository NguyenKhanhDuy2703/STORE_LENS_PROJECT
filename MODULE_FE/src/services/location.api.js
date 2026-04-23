import axiosInstance from "./axios";

const BASE_URL = "/location";

export const getLocationAllocationById = async (locationId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/${locationId}`);
    return response?.data?.data ?? response?.data ?? null;
  } catch (error) {
    console.error(`Error fetching allocation for location ${locationId}:`, error);
    throw new Error(
      error?.response?.data?.message || error?.message || "Failed to fetch location allocation"
    );
  }
};

export default {
  getLocationAllocationById,
};
