import { createAsyncThunk } from "@reduxjs/toolkit";
import { getKPIMetrics, getHourlyCustomerFlow, getRevenueLast7Days, getZoneAnalyticsDashboard } from "../../services/dashboard.api";

export const fetchKPIMetrics = createAsyncThunk(
    "dashboard/fetchKPIs",
    async ({ locationId, type, startCustom, endCustom }, { rejectWithValue }) => {
        try {
            const data = await getKPIMetrics(locationId, type, startCustom, endCustom);
            return data;
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchHourlyCustomerFlow = createAsyncThunk(
    "dashboard/fetchHourlyFlow",
    async ({ locationId, type, startCustom, endCustom }, { rejectWithValue }) => {
        try {
            const data = await getHourlyCustomerFlow(locationId, type, startCustom, endCustom);
            return data;
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchRevenueLast7Days = createAsyncThunk(
    "dashboard/fetchRevenueLast7Days",
    async ({ locationId, type, startCustom, endCustom }, { rejectWithValue }) => {
        try {
            const data = await getRevenueLast7Days(locationId, type, startCustom, endCustom);
            return data;
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchZoneAnalyticsDashboard = createAsyncThunk(
    "dashboard/fetchZoneAnalytics",
    async ({ locationId, type, startCustom, endCustom }, { rejectWithValue }) => {
        try {
            const data = await getZoneAnalyticsDashboard(locationId, type, startCustom, endCustom);
            return data;
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);