import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAreaKPIs,
  fetchAreaHourlyTraffic,
  fetchAreaPerformanceDetails,
  fetchCameraAndZoneInfo,
} from "./areaAnalysis.thunk";

const normalizePerformanceDetailItem = (item, idx) => ({
  zoneId: item?.zone_id || item?.zoneId || item?.id || `ZONE_${idx}`,
  zoneName: item?.zone_name || item?.zoneName || item?.name || `Zone ${idx}`,
  categoryName: item?.category_name || item?.categoryName || "N/A",
  cameraCode: item?.camera_code || item?.cameraCode || "N/A",
  currentPeople: Number(item?.current_people ?? item?.currentPeople ?? 0),
  visitsToday: Number(item?.visits_count ?? item?.visitsToday ?? item?.total_today ?? 0),
  avgDwellMinutes: Number(item?.avg_dwell_time ?? item?.avgDwellMinutes ?? 0),
  conversionRate: Number(item?.conversion_rate ?? item?.conversionRate ?? 0),
  growthRate: Number(item?.growth_rate ?? item?.growthRate ?? 0),
});

export const normalizePerformanceDetails = (payload) => {
  const rows = Array.isArray(payload) ? payload : payload?.table_data;

  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((item, idx) => normalizePerformanceDetailItem(item, idx));
};

const initialState = {
  areaKPIs: null,
  hourlyTraffic: [],
  performanceDetails: [],
  cameras: [],
  zones: [],
  cameraZoneRaw: [],
  loading: {
    kpis: false,
    hourlyTraffic: false,
    performanceDetails: false,
    cameras: false,
  },
  errors: {
    kpis: null,
    hourlyTraffic: null,
    performanceDetails: null,
    cameras: null,
  },
};

const areaAnalysisSlice = createSlice({
  name: "areaAnalysis",
  initialState,
  reducers: {
    clearAreaData: (state) => {
      state.areaKPIs = null;
      state.hourlyTraffic = [];
      state.performanceDetails = [];
      state.cameras = [];
      state.zones = [];
      state.cameraZoneRaw = [];
      state.errors = {
        kpis: null,
        hourlyTraffic: null,
        performanceDetails: null,
        cameras: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAreaKPIs.pending, (state) => {
        state.loading.kpis = true;
        state.errors.kpis = null;
      })
      .addCase(fetchAreaKPIs.fulfilled, (state, action) => {
        state.loading.kpis = false;
        state.areaKPIs = action.payload;
        state.errors.kpis = null;
      })
      .addCase(fetchAreaKPIs.rejected, (state, action) => {
        state.loading.kpis = false;
        state.errors.kpis = action.payload;
      });
    builder
      .addCase(fetchAreaHourlyTraffic.pending, (state) => {
        state.loading.hourlyTraffic = true;
        state.errors.hourlyTraffic = null;
      })
      .addCase(fetchAreaHourlyTraffic.fulfilled, (state, action) => {
        state.loading.hourlyTraffic = false;
        state.hourlyTraffic = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.hourly || [];
        state.errors.hourlyTraffic = null;
      })
      .addCase(fetchAreaHourlyTraffic.rejected, (state, action) => {
        state.loading.hourlyTraffic = false;
        state.errors.hourlyTraffic = action.payload;
      });
    builder
      .addCase(fetchAreaPerformanceDetails.pending, (state) => {
        state.loading.performanceDetails = true;
        state.errors.performanceDetails = null;
      })
      .addCase(fetchAreaPerformanceDetails.fulfilled, (state, action) => {
        state.loading.performanceDetails = false;
        state.performanceDetails = normalizePerformanceDetails(action.payload);
        state.errors.performanceDetails = null;
      })
      .addCase(fetchAreaPerformanceDetails.rejected, (state, action) => {
        state.loading.performanceDetails = false;
        state.errors.performanceDetails = action.payload;
      });
    builder
      .addCase(fetchCameraAndZoneInfo.pending, (state) => {
        state.loading.cameras = true;
        state.errors.cameras = null;
      })
      .addCase(fetchCameraAndZoneInfo.fulfilled, (state, action) => {
        state.loading.cameras = false;
        state.cameras = action.payload?.cameraOptions || [];
        state.zones = action.payload?.zoneOptions || [];
        state.cameraZoneRaw = action.payload?.raw || [];
        state.errors.cameras = null;
      })
      .addCase(fetchCameraAndZoneInfo.rejected, (state, action) => {
        state.loading.cameras = false;
        state.errors.cameras = action.payload;
      });
  },
});

export const { clearAreaData } = areaAnalysisSlice.actions;
export default areaAnalysisSlice.reducer;
