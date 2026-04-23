import axiosInstance from "./axios";
const BASE_URL = "/dashboard";
export const getKPIMetrics = async (locationId, type, startCustom, endCustom) => {
    const response = await axiosInstance.get(`${BASE_URL}/kpis/${locationId}`, {
        data: { type, startCustom, endCustom }
    });
    return response.data.data;
}
export const getHourlyCustomerFlow = async (locationId, type, startCustom, endCustom) => {
    const response = await axiosInstance.get(`${BASE_URL}/hourly-flow/${locationId}`, {
        data: { type, startCustom, endCustom }
    });
    return response.data.data;
}
export const getRevenueLast7Days = async (locationId, type, startCustom, endCustom) => {
    const response = await axiosInstance.get(`${BASE_URL}/revenue-7days/${locationId}`, {
        data: { type, startCustom, endCustom }
    });
    return response.data.data;
}
export const getZoneAnalyticsDashboard = async (locationId, type, startCustom, endCustom) => {
    const response = await axiosInstance.get(`${BASE_URL}/zone-analytics/${locationId}`, {
        data: { type, startCustom, endCustom }
    });
    return response.data.data;
}