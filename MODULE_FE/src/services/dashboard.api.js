import axiosInstance from "./axios";
const BASE_URL = "/dashboard";

// ── Existing APIs (type-based) ────────────────────────────────────────────────
export const getKPIMetrics = async (locationId, type, startCustom, endCustom) => {
    const response = await axiosInstance.get(`${BASE_URL}/kpis/${locationId}`, {
        params: { type, startCustom, endCustom }
    });
    return response.data.data;
}

export const getHourlyCustomerFlow = async (locationId, type, startCustom, endCustom) => {
    const response = await axiosInstance.get(`${BASE_URL}/hourly-flow/${locationId}`, {
        params: { type, startCustom, endCustom }
    });
    return response.data.data;
}

export const getRevenueLast7Days = async (locationId, type, startCustom, endCustom) => {
    const response = await axiosInstance.get(`${BASE_URL}/revenue-7days/${locationId}`, {
        params: { type, startCustom, endCustom }
    });
    return response.data.data;
}

export const getZoneAnalyticsDashboard = async (locationId, type, startCustom, endCustom) => {
    const response = await axiosInstance.get(`${BASE_URL}/zone-analytics/${locationId}`, {
        params: { type, startCustom, endCustom }
    });
    return response.data.data;
}

// ── Monthly APIs ──────────────────────────────────────────────────────────────
export const getMonthlyKPIMetrics = async (locationId, year, month) => {
    const response = await axiosInstance.get(`${BASE_URL}/monthly/kpis/${locationId}`, {
        params: { year, month }
    });
    return response.data.data;
}

export const getDailyStats = async (locationId, year, month) => {
    const response = await axiosInstance.get(`${BASE_URL}/monthly/daily-stats/${locationId}`, {
        params: { year, month }
    });
    return response.data.data;
}

export const getMonthlyZoneAnalytics = async (locationId, year, month) => {
    const response = await axiosInstance.get(`${BASE_URL}/monthly/zone-analytics/${locationId}`, {
        params: { year, month }
    });
    return response.data.data;
}

// ── Yearly APIs ───────────────────────────────────────────────────────────────
export const getYearlyStats = async (locationId, year) => {
    const response = await axiosInstance.get(`${BASE_URL}/monthly/yearly-stats/${locationId}`, {
        params: { year }
    });
    return response.data.data;
}
