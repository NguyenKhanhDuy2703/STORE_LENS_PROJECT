import axiosInstance from "./axios";

const BASE_URL = "/flow-patterns";

// Kích hoạt phân tích cả 2 thuật toán song song
export const analyzeFlowPatterns = async ({ locationId, minSupport, minConfidence, minLift }) => {
    const response = await axiosInstance.post(`${BASE_URL}/analyze/${locationId}`, {
        minSupport,
        minConfidence,
        minLift,
    });
    return response.data.data;
};

// Lấy tất cả patterns đã lưu (không filter algorithm)
export const getFlowPatterns = async ({ locationId }) => {
    const response = await axiosInstance.get(`${BASE_URL}/${locationId}`);
    return response.data.data;
};
