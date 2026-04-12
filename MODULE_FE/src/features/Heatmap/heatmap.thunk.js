import { createAsyncThunk } from "@reduxjs/toolkit";
import { getHeatmapData } from "../../services/heatmap.api";

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
  }
);
