import axiosInstance from "./axios";

// Vì baseURL đã là ".../api/v1" rồi, nên BASE_URL ở đây chỉ cần là "/auth"
const BASE_URL = "/auth";

export const login = async (data) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/login`, data);
    return response.data; // <--- Chỉ lấy data để Redux xử lý cho gọn
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to login");
  }
}
export const signup = async (data) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/register`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to signup");
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/logout`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to logout");
  }
};

export const getToken = async () => {
  try {
    
    const response = await axiosInstance.get(`/gettoken`); 
    return response.data;
  } catch (error) {
    throw new Error("Failed to get token");
  }
};