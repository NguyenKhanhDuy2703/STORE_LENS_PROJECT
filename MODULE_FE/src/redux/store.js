import { configureStore } from "@reduxjs/toolkit";
import customerRuleReducer from "../features/AnalyticsRules/analyticsRules.slice";
import heatmapReducer from "../features/Heatmap/heatmap.slice";
import cameraZonesReducer from "../features/Map/cameraZonesSlice";
import dashboardReducer from "../features/Dashboard/dashboard.slice";
import authReducer from "../features/Authentication/auth.slice";
import globalReducer from "./slices/global.slice";
import assetReducer from "../features/AssetManagement/asset.slice";
import cameraReducer from "../features/ManagermentCamera/camera.slice";
import notificationReducer from "../features/Notification/notification.slice";
import dwellTimeReducer from "../features/Downtime/dwellTime.slice";
import areaAnalysisReducer from "../features/AnalyticsArea/area.slice";
import analyticsFlowReducer from "../features/AnalyticsFlow/analyticsFlow.slice";
import memberReducer from "../features/ManagermentMember/member.slice";

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
    notification: notificationReducer,
    dwellTime: dwellTimeReducer,
    areaAnalysis: areaAnalysisReducer,
    analyticsFlow: analyticsFlowReducer,
    member: memberReducer,
  },
});

export default store;