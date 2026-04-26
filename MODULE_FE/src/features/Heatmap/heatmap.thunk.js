import { createAsyncThunk } from "@reduxjs/toolkit";
import { getHeatmapData } from "../../services/heatmap.api";
import { getCameraWithZonesByLocationId } from "../../services/camera.api";
export const fetchMatrixHeatmap = createAsyncThunk(
  "heatmap/fetchMatrix",
  async ({ locationId, cameraId, date }, { rejectWithValue }) => {
    try {
      const responseData = await getHeatmapData({ locationId, cameraId, date });
      return {
        heatmapData: responseData.heatmapData,
        url_image_snapshot: responseData.url_image_snapshot || "",
      };
    } catch (error) {
      console.error("Error fetching heatmap data in thunk:", error);
      return rejectWithValue(error.message);
    }
  },
);

export const fetchCameraWithZones = createAsyncThunk(
  "heatmap/fetchCameraWithZones",
  async (locationId, { rejectWithValue }) => {
    try {
      const finalLocationId = typeof locationId === "string" ? locationId : locationId?.locationId;

      if (!finalLocationId) {
        return rejectWithValue("Location ID is required");
      }

      const data = await getCameraWithZonesByLocationId(finalLocationId);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching camera with zones in thunk:", error);
      return rejectWithValue(error.message || "Failed to fetch camera-zone list");
    }
  },
);
