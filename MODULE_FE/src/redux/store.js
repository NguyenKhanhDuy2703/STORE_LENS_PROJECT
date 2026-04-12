import { configureStore } from "@reduxjs/toolkit";
import memberSegmentationReducer from "../features/MemberSegmentation/member.slice";
import notificationReducer from "./slices/notificationSlice";
import customerRuleReducer from "../features/AnalyticsRules/analyticsRules.slice";

const store = configureStore({
  reducer: {
    memberSegmentation: memberSegmentationReducer,
    notifications: notificationReducer,
    customerRules : customerRuleReducer,
  },
});

export default store;