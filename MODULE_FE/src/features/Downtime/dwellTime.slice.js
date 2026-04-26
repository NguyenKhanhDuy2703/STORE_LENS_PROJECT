import { createSlice } from "@reduxjs/toolkit";
import {
	fetchAnalysisDwellTime,
	fetchDwellTimeMetrics,
	fetchPerformanceInteract,
} from "./dwellTime.thunk";

const initialState = {
	metrics: {
		max_time: 0,
		min_time: 0,
		avg_time: 0,
	},
	performanceInteract: [],
	analysisDwellTime: [],
	metricsLoading: false,
	performanceLoading: false,
	analysisLoading: false,
	metricsError: null,
	performanceError: null,
	analysisError: null,
};

const dwellTimeSlice = createSlice({
	name: "dwellTime",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchDwellTimeMetrics.pending, (state) => {
				state.metricsLoading = true;
				state.metricsError = null;
			})
			.addCase(fetchDwellTimeMetrics.fulfilled, (state, action) => {
				state.metricsLoading = false;
				state.metrics = action.payload || initialState.metrics;
			})
			.addCase(fetchDwellTimeMetrics.rejected, (state, action) => {
				state.metricsLoading = false;
				state.metricsError = action.payload || "Failed to fetch dwell time metrics";
			})
			.addCase(fetchPerformanceInteract.pending, (state) => {
				state.performanceLoading = true;
				state.performanceError = null;
			})
			.addCase(fetchPerformanceInteract.fulfilled, (state, action) => {
				state.performanceLoading = false;
				state.performanceInteract = action.payload || [];
			})
			.addCase(fetchPerformanceInteract.rejected, (state, action) => {
				state.performanceLoading = false;
				state.performanceError = action.payload || "Failed to fetch dwell time performance data";
			})
			.addCase(fetchAnalysisDwellTime.pending, (state) => {
				state.analysisLoading = true;
				state.analysisError = null;
			})
			.addCase(fetchAnalysisDwellTime.fulfilled, (state, action) => {
				state.analysisLoading = false;
				state.analysisDwellTime = action.payload || [];
			})
			.addCase(fetchAnalysisDwellTime.rejected, (state, action) => {
				state.analysisLoading = false;
				state.analysisError = action.payload || "Failed to fetch dwell time analysis";
			});
	},
});

export default dwellTimeSlice.reducer;
