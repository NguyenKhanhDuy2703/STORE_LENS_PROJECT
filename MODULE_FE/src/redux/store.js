import { configureStore } from "@reduxjs/toolkit";
import memberSegmentationReducer from "../features/MemberSegmentation/member.slice";
import notificationReducer from "./slices/notificationSlice";
import customerRuleReducer from "../features/AnalyticsRules/analyticsRules.slice";
<<<<<<< HEAD
import authReducer from "../features/Authentication/authSlice";
import storesReducer from "./slices/storesSlice";
import filterReducer from "./slices/filterSlice";
=======
import heatmapReducer from "../features/Heatmap/heatmap.slice";
import cameraZonesReducer from "../features/Map/cameraZonesSlice";
>>>>>>> b36b64c41a8b7a3b2981d4ab0c0add2770fcc54d

const store = configureStore({
  reducer: {
    memberSegmentation: memberSegmentationReducer,
    notifications: notificationReducer,
    customerRules : customerRuleReducer,
<<<<<<< HEAD
    auth: authReducer,
    stores: storesReducer,
    filter: filterReducer,
=======
    heatmap: heatmapReducer,
    cameraZones: cameraZonesReducer,
>>>>>>> b36b64c41a8b7a3b2981d4ab0c0add2770fcc54d
  },
});

export default store;