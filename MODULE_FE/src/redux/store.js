import { configureStore } from "@reduxjs/toolkit";
import memberSegmentationReducer from "../features/MemberSegmentation/member.slice";
import customerRuleReducer from "../features/AnalyticsRules/analyticsRules.slice";
import heatmapReducer from "../features/Heatmap/heatmap.slice";
import cameraZonesReducer from "../features/Map/cameraZonesSlice";
import dashboardReducer from "../features/Dashboard/dashboard.slice";
import authReducer from "../features/Authentication/auth.slice";
import globalReducer from "./slices/global.slice";
import assetReducer from "../features/AssetManagement/asset.slice";
import cameraReducer from "../features/ManagermentCamera/camera.slice";

const store = configureStore({
  reducer: {
    customerRules : customerRuleReducer,
    heatmap: heatmapReducer,
    cameraZones: cameraZonesReducer,
    dashboard: dashboardReducer,
    auth: authReducer,
    filter: globalReducer,
    asset: assetReducer,
    camera: cameraReducer,
  },
});

export default store;