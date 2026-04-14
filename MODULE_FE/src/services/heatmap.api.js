import axiosInstance from "./axios";
const BASE_URL = "/heatmap";
export const getHeatmapData = async ({ locationId, cameraId, date }) => {
    try {
        const response = await axiosInstance.get(
            `${BASE_URL}/${locationId}/${cameraId}`,
            {
                params: { date },
            }
        );
        if (response.status !== 200) {
            throw new Error(`Failed to fetch heatmap data: ${response.statusText}`);
        }
        const responseData = response.data.data;
        if (!responseData.heatmapData || !Array.isArray(responseData.heatmapData)) {
            throw new Error("Invalid heatmap data format");
        }
        
        return responseData; 
    } catch (error) {
        console.error("Error fetching heatmap data:", error);
        throw error;
    }
};