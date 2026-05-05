import axiosInstance from "./axios";

const BASE_URL = "/reports"; 

const exportComprehensiveReport = async (locationId, params) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/attendance/${locationId}`,
      params, 
      { 
        responseType: "blob", 
        timeout: 30000       
      }
    );
    return response; 
  } catch (error) {
    console.error("Error exporting report:", error);
    throw error;
  }
};

export default {
 
  exportComprehensiveReport
};