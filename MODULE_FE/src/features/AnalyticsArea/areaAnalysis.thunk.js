import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAreaManagementKPIs,
  getAreaManagementHourlyTraffic,
  getAreaManagementPerformanceDetails,
} from "../../services/areaAnalysis.api";
import { getCameraAndZoneInfo } from "../../services/camera.api";
/**
 * Fetch KPI metrics for area management
 */
export const fetchAreaKPIs = createAsyncThunk(
  "areaAnalysis/fetchKPIs",
  async ({ locationId, type, cameraId, zoneId }, { rejectWithValue }) => {
    try {
      const data = await getAreaManagementKPIs({ locationId, type, cameraId, zoneId });
      return data;
    } catch (error) {
      console.error("Error fetching area KPIs in thunk:", error);
      return rejectWithValue(error.message || "Failed to fetch KPIs");
    }
  }
);

/**
 * Fetch hourly traffic data for area management
 */
export const fetchAreaHourlyTraffic = createAsyncThunk(
  "areaAnalysis/fetchHourlyTraffic",
  async ({ locationId, type, cameraId, zoneId }, { rejectWithValue }) => {
    try {
      const data = await getAreaManagementHourlyTraffic({ locationId, type, cameraId, zoneId });
      return data;
    } catch (error) {
      console.error("Error fetching hourly traffic in thunk:", error);
      return rejectWithValue(error.message || "Failed to fetch hourly traffic");
    }
  }
);

/**
 * Fetch performance details for all zones in a location
 */
export const fetchAreaPerformanceDetails = createAsyncThunk(
  "areaAnalysis/fetchPerformanceDetails",
  async ({ locationId, type, cameraId, zoneId }, { rejectWithValue }) => {
    try {
      const data = await getAreaManagementPerformanceDetails({ locationId, type, cameraId, zoneId });
      return data;
    } catch (error) {
      console.error("Error fetching performance details in thunk:", error);
      return rejectWithValue(error.message || "Failed to fetch performance details");
    }
  }
);
export const fetchCameraAndZoneInfo = createAsyncThunk(
  "areaAnalysis/fetchCameraAndZoneInfo",
  async (payload, { rejectWithValue }) => {
    try {
      const locationId = typeof payload === "string" ? payload : payload?.locationId;

      if (!locationId) {
        return rejectWithValue("Location ID is required");
      }

      const rows = await getCameraAndZoneInfo(locationId);

      const cameraMap = new Map();
      const zoneMap = new Map();

      (Array.isArray(rows) ? rows : []).forEach((item) => {
        const cameraCode = item?.camera_code || item?.cameraCode;
        const cameraName = item?.camera_name || item?.cameraName || cameraCode;
        const zoneId = item?.zone_id || item?.zoneId;
        const zoneName = item?.zone_name || item?.zoneName || zoneId;

        if (cameraCode && !cameraMap.has(cameraCode)) {
          cameraMap.set(cameraCode, { code: cameraCode, name: cameraName });
        }

        if (zoneId && !zoneMap.has(zoneId)) {
          zoneMap.set(zoneId, {
            id: zoneId,
            name: zoneName,
            cameraCode: cameraCode || null,
          });
        }
      });

      return {
        cameraOptions: Array.from(cameraMap.values()),
        zoneOptions: Array.from(zoneMap.values()),
        raw: rows,
      };
    } catch (error) {
      console.error("Error fetching camera and zone info in thunk:", error);
      return rejectWithValue(error.message || "Failed to fetch camera and zone info");
    } 
  }
);