import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    getKPIMetrics, getHourlyCustomerFlow, getRevenueLast7Days, getZoneAnalyticsDashboard,
    getMonthlyKPIMetrics, getDailyStats, getMonthlyZoneAnalytics, getYearlyStats
} from "../../services/dashboard.api";

// ── Existing thunks ───────────────────────────────────────────────────────────
export const fetchKPIMetrics = createAsyncThunk(
    "dashboard/fetchKPIs",
    async ({ locationId, type, startCustom, endCustom }, { rejectWithValue }) => {
        try { return await getKPIMetrics(locationId, type, startCustom, endCustom); }
        catch (error) { return rejectWithValue(error.message); }
    }
);
export const fetchHourlyCustomerFlow = createAsyncThunk(
    "dashboard/fetchHourlyFlow",
    async ({ locationId, type, startCustom, endCustom }, { rejectWithValue }) => {
        try { return await getHourlyCustomerFlow(locationId, type, startCustom, endCustom); }
        catch (error) { return rejectWithValue(error.message); }
    }
);
export const fetchRevenueLast7Days = createAsyncThunk(
    "dashboard/fetchRevenueLast7Days",
    async ({ locationId, type, startCustom, endCustom }, { rejectWithValue }) => {
        try { return await getRevenueLast7Days(locationId, type, startCustom, endCustom); }
        catch (error) { return rejectWithValue(error.message); }
    }
);
export const fetchZoneAnalyticsDashboard = createAsyncThunk(
    "dashboard/fetchZoneAnalytics",
    async ({ locationId, type, startCustom, endCustom }, { rejectWithValue }) => {
        try { return await getZoneAnalyticsDashboard(locationId, type, startCustom, endCustom); }
        catch (error) { return rejectWithValue(error.message); }
    }
);

// ── Monthly thunks ────────────────────────────────────────────────────────────
export const fetchMonthlyKPIMetrics = createAsyncThunk(
    "dashboard/fetchMonthlyKPIs",
    async ({ locationId, year, month }, { rejectWithValue }) => {
        try { return await getMonthlyKPIMetrics(locationId, year, month); }
        catch (error) { return rejectWithValue(error.message); }
    }
);
export const fetchDailyStats = createAsyncThunk(
    "dashboard/fetchDailyStats",
    async ({ locationId, year, month }, { rejectWithValue }) => {
        try { return await getDailyStats(locationId, year, month); }
        catch (error) { return rejectWithValue(error.message); }
    }
);
export const fetchMonthlyZoneAnalytics = createAsyncThunk(
    "dashboard/fetchMonthlyZoneAnalytics",
    async ({ locationId, year, month }, { rejectWithValue }) => {
        try { return await getMonthlyZoneAnalytics(locationId, year, month); }
        catch (error) { return rejectWithValue(error.message); }
    }
);

// ── Yearly thunks ─────────────────────────────────────────────────────────────
export const fetchYearlyStats = createAsyncThunk(
    "dashboard/fetchYearlyStats",
    async ({ locationId, year }, { rejectWithValue }) => {
        try { return await getYearlyStats(locationId, year); }
        catch (error) { return rejectWithValue(error.message); }
    }
);
