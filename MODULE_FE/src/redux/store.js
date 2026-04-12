import { configureStore } from "@reduxjs/toolkit";
import memberSegmentationReducer from "../features/MemberSegmentation/member.slice";
import notificationReducer from "./slices/notificationSlice";
import customerRuleReducer from "../features/AnalyticsRules/analyticsRules.slice";
import heatmapReducer from "../features/Heatmap/heatmap.slice";
import cameraZonesReducer from "../features/Map/cameraZonesSlice";

const store = configureStore({
  reducer: {
    memberSegmentation: memberSegmentationReducer,
    notifications: notificationReducer,
    customerRules : customerRuleReducer,
    heatmap: heatmapReducer,
    cameraZones: cameraZonesReducer,
  },
});

export default store;