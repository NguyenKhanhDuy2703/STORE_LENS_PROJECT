import axiosInstance from "./axios";
const BASE_URL = "/stores";


export const getAllStores = async () => {
  try {
   
    const response = await axiosInstance.get(`${BASE_URL}`);
    
    
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy danh sách cửa hàng"
    );
  }
};
export const getStoreById = async (storeId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/${storeId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi lấy thông tin cửa hàng");
  }
};