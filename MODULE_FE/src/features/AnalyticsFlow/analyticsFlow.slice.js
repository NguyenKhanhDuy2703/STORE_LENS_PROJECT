import { createSlice } from "@reduxjs/toolkit";
import { fetchFlowPatterns, runFlowAnalysis } from "./analyticsFlow.thunk";

const analyticsFlowSlice = createSlice({
    name: "analyticsFlow",
    initialState: {
        patterns: [],
        loading: false,
        analyzing: false,
        error: null,
        activeFilter: "all",
    },
    reducers: {
        setActiveFilter: (state, action) => {
            state.activeFilter = action.payload;
        },
        clearPatterns: (state) => {
            state.patterns = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFlowPatterns.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFlowPatterns.fulfilled, (state, action) => {
                state.loading = false;
                state.patterns = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchFlowPatterns.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Không thể tải dữ liệu.";
            })
            .addCase(runFlowAnalysis.pending, (state) => {
                state.analyzing = true;
                state.error = null;
            })
            .addCase(runFlowAnalysis.fulfilled, (state, action) => {
                state.analyzing = false;
                state.patterns = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(runFlowAnalysis.rejected, (state, action) => {
                state.analyzing = false;
                state.error = action.payload || "Phân tích thất bại.";
            });
    },
});

export const { setActiveFilter, clearPatterns } = analyticsFlowSlice.actions;
export default analyticsFlowSlice.reducer;
