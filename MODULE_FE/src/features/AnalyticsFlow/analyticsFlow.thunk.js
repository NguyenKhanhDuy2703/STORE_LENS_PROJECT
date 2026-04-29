import { createAsyncThunk } from "@reduxjs/toolkit";
import { analyzeFlowPatterns, getFlowPatterns } from "../../services/flowPatterns.api";

// Lấy tất cả patterns đã lưu (không filter algorithm)
export const fetchFlowPatterns = createAsyncThunk(
    "analyticsFlow/fetch",
    async ({ locationId }, { rejectWithValue }) => {
        try {
            return await getFlowPatterns({ locationId });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Chạy phân tích cả 2 thuật toán song song
export const runFlowAnalysis = createAsyncThunk(
    "analyticsFlow/analyze",
    async ({ locationId, minSupport, minConfidence, minLift }, { rejectWithValue }) => {
        try {
            return await analyzeFlowPatterns({ locationId, minSupport, minConfidence, minLift });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
