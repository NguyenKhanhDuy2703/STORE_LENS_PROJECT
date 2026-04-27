import { createSlice } from "@reduxjs/toolkit";
import { fetchZoneAnalyticsDashboard, fetchKPIMetrics, fetchHourlyCustomerFlow, fetchRevenueLast7Days } from "./dashboard.thunk";

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState: {
       metrics : {},
       chartData:{},
       tableData :{},
       zoneAnalytics: {
           zones: [],
           performance: [],
           lastUpdated: null
       },
       kpiMetrics: {
           total_revenue: 0,
           total_customers: 0,
           conversion_rate: 0,
           current_visitors: 0,
           waiting_queue: 0,
           zone_counts: {},
           last_updated: null,
           location_id: null,
           date: null
       },
       hourlyCustomerFlow: [],
       revenueLast7Days: [],
       loading: false,
       zoneAnalyticsLoading: false,
       kpiMetricsLoading: false,
       hourlyCustomerFlowLoading: false,
       revenueLast7DaysLoading: false,
       error: null,
       zoneAnalyticsError: null,
       kpiMetricsError: null,
       hourlyCustomerFlowError: null,
       revenueLast7DaysError: null,
    },
    reducers: {
        // Được gọi bởi Socket.IO listener để patch realtime mà không refetch toàn bộ KPI
        updateRealtimePeople(state, action) {
            const { people_current, zone_counts } = action.payload || {};
            if (state.kpiMetrics) {
                if (people_current !== undefined) {
                    state.kpiMetrics.current_visitors = people_current;
                }
                if (zone_counts !== undefined) {
                    state.kpiMetrics.zone_counts = zone_counts;
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchZoneAnalyticsDashboard.pending, (state) => {
                state.zoneAnalyticsLoading = true;
                state.zoneAnalyticsError = null;
            })
            .addCase(fetchZoneAnalyticsDashboard.fulfilled, (state, action) => {
                state.zoneAnalyticsLoading = false;
                state.zoneAnalytics = action.payload || { zones: [], performance: [], lastUpdated: null };
            })
            .addCase(fetchZoneAnalyticsDashboard.rejected, (state, action) => {
                state.zoneAnalyticsLoading = false;
                state.zoneAnalyticsError = action.payload || 'Failed to fetch zone analytics';
            })
            .addCase(fetchKPIMetrics.pending, (state) => {
                state.kpiMetricsLoading = true;
                state.kpiMetricsError = null;
            })
            .addCase(fetchKPIMetrics.fulfilled, (state, action) => {
                state.kpiMetricsLoading = false;
                state.kpiMetrics = action.payload || {
                    total_revenue: 0,
                    total_customers: 0,
                    conversion_rate: 0,
                    current_visitors: 0,
                    waiting_queue: 0,
                    zone_counts: {},
                    last_updated: null,
                    location_id: null,
                    date: null
                };
            })
            .addCase(fetchKPIMetrics.rejected, (state, action) => {
                state.kpiMetricsLoading = false;
                state.kpiMetricsError = action.payload || 'Failed to fetch KPI metrics';
            })
            .addCase(fetchHourlyCustomerFlow.pending, (state) => {
                state.hourlyCustomerFlowLoading = true;
                state.hourlyCustomerFlowError = null;
            })
            .addCase(fetchHourlyCustomerFlow.fulfilled, (state, action) => {
                state.hourlyCustomerFlowLoading = false;
                state.hourlyCustomerFlow = action.payload || { hourly: [], lastUpdated: null };
            })
            .addCase(fetchHourlyCustomerFlow.rejected, (state, action) => {
                state.hourlyCustomerFlowLoading = false;
                state.hourlyCustomerFlowError = action.payload || 'Failed to fetch hourly customer flow';
            })
            .addCase(fetchRevenueLast7Days.pending, (state) => {
                state.revenueLast7DaysLoading = true;
                state.revenueLast7DaysError = null;
            })
            .addCase(fetchRevenueLast7Days.fulfilled, (state, action) => {
                state.revenueLast7DaysLoading = false;
                state.revenueLast7Days = action.payload || { revenue_data: [], lastUpdated: null };
            })
            .addCase(fetchRevenueLast7Days.rejected, (state, action) => {
                state.revenueLast7DaysLoading = false;
                state.revenueLast7DaysError = action.payload || 'Failed to fetch revenue last 7 days';
            });
    },
});

export const { updateRealtimePeople } = dashboardSlice.actions;
export default dashboardSlice.reducer;