import { createSlice } from "@reduxjs/toolkit";
import { fetchMatrixHeatmap } from "./heatmap.thunk";

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
    error: null,
  },
  reducers: {
    setCurrentHeatmap: (state, action) => {
      const { timeStamp } = action.payload;
      state.currentHeatmap = state.infoHeatmapMatrix.find(
        (item) => item.timeStamp === timeStamp,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatrixHeatmap.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMatrixHeatmap.fulfilled, (state, action) => {
        const rawData = action.payload.heatmapData || [];
        const snapshotUrl = action.payload.url_image_snapshot;
        state.infoHeatmapMatrix = [];
        state.timeLine = [];
        state.backgroundImage = snapshotUrl;
        
        for (const item of rawData) {
          state.infoHeatmapMatrix.push(heatmapHelper(item, snapshotUrl));
          state.timeLine.push(item.time_stamp);
        }

        if (state.infoHeatmapMatrix.length > 0) {
          state.currentHeatmap = state.infoHeatmapMatrix[state.infoHeatmapMatrix.length - 1];
        }

        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchMatrixHeatmap.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentHeatmap } = HeatmapSlice.actions;
export default HeatmapSlice.reducer;
