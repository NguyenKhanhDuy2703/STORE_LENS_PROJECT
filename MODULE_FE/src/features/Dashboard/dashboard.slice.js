import { createSlice } from "@reduxjs/toolkit";
import {
    fetchZoneAnalyticsDashboard, fetchKPIMetrics, fetchHourlyCustomerFlow, fetchRevenueLast7Days,
    fetchMonthlyKPIMetrics, fetchDailyStats, fetchMonthlyZoneAnalytics, fetchYearlyStats
} from "./dashboard.thunk";

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState: {
       metrics : {},
       chartData:{},
       tableData :{},
       zoneAnalytics: { zones: [], performance: [], lastUpdated: null },
       kpiMetrics: {
           total_revenue: 0, total_customers: 0, conversion_rate: 0,
           current_visitors: 0, waiting_queue: 0, zone_counts: {},
           last_updated: null, location_id: null, date: null
       },
       hourlyCustomerFlow: [],
       revenueLast7Days: [],
       // Monthly state
       monthlyKPIMetrics: null,
       dailyStats: null,
       monthlyZoneAnalytics: null,
       // Yearly state
       yearlyStats: null,
       // Loading
       loading: false,
       zoneAnalyticsLoading: false,
       kpiMetricsLoading: false,
       hourlyCustomerFlowLoading: false,
       revenueLast7DaysLoading: false,
       monthlyKPILoading: false,
       dailyStatsLoading: false,
       monthlyZoneLoading: false,
       yearlyStatsLoading: false,
       // Errors
       error: null,
       zoneAnalyticsError: null,
       kpiMetricsError: null,
       hourlyCustomerFlowError: null,
       revenueLast7DaysError: null,
       monthlyKPIError: null,
       dailyStatsError: null,
       monthlyZoneError: null,
       yearlyStatsError: null,
    },
    reducers: {
        updateRealtimePeople(state, action) {
            const { people_current, zone_counts } = action.payload || {};
            if (state.kpiMetrics) {
                if (people_current !== undefined) state.kpiMetrics.current_visitors = people_current;
                if (zone_counts    !== undefined) state.kpiMetrics.zone_counts = zone_counts;
            }
            // Cũng cập nhật monthlyKPIMetrics nếu đang xem tháng hiện tại
            if (state.monthlyKPIMetrics) {
                if (people_current !== undefined) state.monthlyKPIMetrics.current_visitors = people_current;
                if (zone_counts    !== undefined) state.monthlyKPIMetrics.zone_counts = zone_counts;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Existing
            .addCase(fetchZoneAnalyticsDashboard.pending,   s => { s.zoneAnalyticsLoading = true;  s.zoneAnalyticsError = null; })
            .addCase(fetchZoneAnalyticsDashboard.fulfilled, (s, a) => { s.zoneAnalyticsLoading = false; s.zoneAnalytics = a.payload || { zones: [], performance: [], lastUpdated: null }; })
            .addCase(fetchZoneAnalyticsDashboard.rejected,  (s, a) => { s.zoneAnalyticsLoading = false; s.zoneAnalyticsError = a.payload || 'Failed'; })
            .addCase(fetchKPIMetrics.pending,   s => { s.kpiMetricsLoading = true;  s.kpiMetricsError = null; })
            .addCase(fetchKPIMetrics.fulfilled, (s, a) => { s.kpiMetricsLoading = false; s.kpiMetrics = a.payload || s.kpiMetrics; })
            .addCase(fetchKPIMetrics.rejected,  (s, a) => { s.kpiMetricsLoading = false; s.kpiMetricsError = a.payload || 'Failed'; })
            .addCase(fetchHourlyCustomerFlow.pending,   s => { s.hourlyCustomerFlowLoading = true;  s.hourlyCustomerFlowError = null; })
            .addCase(fetchHourlyCustomerFlow.fulfilled, (s, a) => { s.hourlyCustomerFlowLoading = false; s.hourlyCustomerFlow = a.payload || { hourly: [], lastUpdated: null }; })
            .addCase(fetchHourlyCustomerFlow.rejected,  (s, a) => { s.hourlyCustomerFlowLoading = false; s.hourlyCustomerFlowError = a.payload || 'Failed'; })
            .addCase(fetchRevenueLast7Days.pending,   s => { s.revenueLast7DaysLoading = true;  s.revenueLast7DaysError = null; })
            .addCase(fetchRevenueLast7Days.fulfilled, (s, a) => { s.revenueLast7DaysLoading = false; s.revenueLast7Days = a.payload || { revenue_data: [], lastUpdated: null }; })
            .addCase(fetchRevenueLast7Days.rejected,  (s, a) => { s.revenueLast7DaysLoading = false; s.revenueLast7DaysError = a.payload || 'Failed'; })
            // Monthly
            .addCase(fetchMonthlyKPIMetrics.pending,   s => { s.monthlyKPILoading = true;  s.monthlyKPIError = null; })
            .addCase(fetchMonthlyKPIMetrics.fulfilled, (s, a) => { s.monthlyKPILoading = false; s.monthlyKPIMetrics = a.payload; })
            .addCase(fetchMonthlyKPIMetrics.rejected,  (s, a) => { s.monthlyKPILoading = false; s.monthlyKPIError = a.payload || 'Failed'; })
            .addCase(fetchDailyStats.pending,   s => { s.dailyStatsLoading = true;  s.dailyStatsError = null; })
            .addCase(fetchDailyStats.fulfilled, (s, a) => { s.dailyStatsLoading = false; s.dailyStats = a.payload; })
            .addCase(fetchDailyStats.rejected,  (s, a) => { s.dailyStatsLoading = false; s.dailyStatsError = a.payload || 'Failed'; })
            .addCase(fetchMonthlyZoneAnalytics.pending,   s => { s.monthlyZoneLoading = true;  s.monthlyZoneError = null; })
            .addCase(fetchMonthlyZoneAnalytics.fulfilled, (s, a) => { s.monthlyZoneLoading = false; s.monthlyZoneAnalytics = a.payload; })
            .addCase(fetchMonthlyZoneAnalytics.rejected,  (s, a) => { s.monthlyZoneLoading = false; s.monthlyZoneError = a.payload || 'Failed'; })
            // Yearly
            .addCase(fetchYearlyStats.pending,   s => { s.yearlyStatsLoading = true;  s.yearlyStatsError = null; })
            .addCase(fetchYearlyStats.fulfilled, (s, a) => { s.yearlyStatsLoading = false; s.yearlyStats = a.payload; })
            .addCase(fetchYearlyStats.rejected,  (s, a) => { s.yearlyStatsLoading = false; s.yearlyStatsError = a.payload || 'Failed'; });
    },
});

export const { updateRealtimePeople } = dashboardSlice.actions;
export default dashboardSlice.reducer;