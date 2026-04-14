import { configureStore } from "@reduxjs/toolkit";
import memberSegmentationReducer from "../features/MemberSegmentation/member.slice";
import notificationReducer from "./slices/notificationSlice";
import customerRuleReducer from "../features/AnalyticsRules/analyticsRules.slice";
import authReducer from "../features/Authentication/authSlice";
import storesReducer from "./slices/storesSlice";
import filterReducer from "./slices/filterSlice";

const store = configureStore({
  reducer: {
    memberSegmentation: memberSegmentationReducer,
    notifications: notificationReducer,
    customerRules : customerRuleReducer,
    auth: authReducer,
    stores: storesReducer,
    filter: filterReducer,
  },
});

export default store;