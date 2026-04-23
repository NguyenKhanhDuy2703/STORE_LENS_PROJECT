import { createSlice } from "@reduxjs/toolkit";
import { fetchMatrixHeatmap, fetchCameraWithZones } from "./heatmap.thunk";

const heatmapHelper = (item, backgroundImage) => {
  return {
    cameraCode: item.camera_id,
    locationId: item.location_id,
    timeStamp: item.time_stamp,
    heatmapMatrix: item.heatmap_matrix,
    gridSize: item.grid_size,
    frameWidth: item.frame_width,
    frameHeight: item.frame_height,
    widthMatrix: item.width_matrix,
    heightMatrix: item.height_matrix,
    zones: item.zones || [],
    backgroundImage: item.background_image || backgroundImage || "",
  };
};

const HeatmapSlice = createSlice({
  name: "heatmap",
  initialState: {
    infoHeatmapMatrix: [], 
    timeLine: [], 
    currentHeatmap: null, 
    backgroundImage: "", 
    isLoading: false,
    cameraList: [],
    cameraListLoading: false,
    error: null,
    cameraListError: null,
  },
  reducers: {
    setCurrentHeatmap: (state, action) => {
      const { timeStamp } = action.payload;
      state.currentHeatmap = state.infoHeatmapMatrix.find(
        (item) => item.timeStamp === timeStamp,
      );
    },
    clearHeatmapData: (state) => {
      state.infoHeatmapMatrix = [];
      state.timeLine = [];
      state.currentHeatmap = null;
      state.backgroundImage = "";
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatrixHeatmap.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.infoHeatmapMatrix = [];
        state.timeLine = [];
        state.currentHeatmap = null;
        state.backgroundImage = "";
      })
      .addCase(fetchMatrixHeatmap.fulfilled, (state, action) => {
        const rawData = action.payload.heatmapData || [];
        const snapshotUrl = action.payload.url_image_snapshot || "";
        state.infoHeatmapMatrix = [];
        state.timeLine = [];
        state.backgroundImage = snapshotUrl;
        
        for (const item of rawData) {
          state.infoHeatmapMatrix.push(heatmapHelper(item, snapshotUrl));
          state.timeLine.push(item.time_stamp);
        }

        if (state.infoHeatmapMatrix.length > 0) {
          state.currentHeatmap = state.infoHeatmapMatrix[state.infoHeatmapMatrix.length - 1];
        } else {
          state.currentHeatmap = null;
        }

        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchMatrixHeatmap.rejected, (state, action) => {
        state.infoHeatmapMatrix = [];
        state.timeLine = [];
        state.currentHeatmap = null;
        state.backgroundImage = "";
        state.isLoading = false;
        state.error = action.payload || "Không có dữ liệu heatmap";
      })
      .addCase(fetchCameraWithZones.pending, (state) => {
        state.cameraListLoading = true;
        state.cameraListError = null;
      })
      .addCase(fetchCameraWithZones.fulfilled, (state, action) => {
        state.cameraListLoading = false;
        state.cameraList = Array.isArray(action.payload) ? action.payload : [];
        state.cameraListError = null;
      })
      .addCase(fetchCameraWithZones.rejected, (state, action) => {
        state.cameraListLoading = false;
        state.cameraListError = action.payload;
      });
  },
});

export const { setCurrentHeatmap, clearHeatmapData } = HeatmapSlice.actions;
export default HeatmapSlice.reducer;
