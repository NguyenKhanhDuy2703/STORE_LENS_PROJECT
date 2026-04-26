import { createAsyncThunk } from "@reduxjs/toolkit";
import dwellTimeApi from "../../services/dwelltime.api";

export const fetchDwellTimeMetrics = createAsyncThunk(
	"dwellTime/fetchMetrics",
	async ({ locationId, date }, { rejectWithValue }) => {
		try {
			return await dwellTimeApi.getDwellTimeMetrics({ locationId, date });
		} catch (error) {
			return rejectWithValue(
				error?.response?.data?.message || error.message || "Failed to fetch dwell time metrics"
			);
		}
	}
);

export const fetchPerformanceInteract = createAsyncThunk(
	"dwellTime/fetchPerformanceInteract",
	async ({ locationId, date }, { rejectWithValue }) => {
		try {
			return await dwellTimeApi.getPerformanceInteract({ locationId, date });
		} catch (error) {
			return rejectWithValue(
				error?.response?.data?.message || error.message || "Failed to fetch dwell time performance data"
			);
		}
	}
);

export const fetchAnalysisDwellTime = createAsyncThunk(
	"dwellTime/fetchAnalysisDwellTime",
	async ({ locationId, date }, { rejectWithValue }) => {
		try {
			return await dwellTimeApi.getAnalysisDwellTime({ locationId, date });
		} catch (error) {
			return rejectWithValue(
				error?.response?.data?.message || error.message || "Failed to fetch dwell time analysis"
			);
		}
	}
);
