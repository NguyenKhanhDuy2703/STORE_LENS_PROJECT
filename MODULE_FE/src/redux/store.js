import { configureStore } from "@reduxjs/toolkit";
import memberSegmentationReducer from "../features/MemberSegmentation/member.slice";
import notificationReducer from "./slices/notificationSlice";

const store = configureStore({
  reducer: {
    memberSegmentation: memberSegmentationReducer,
    notifications: notificationReducer,
  },
});

export default store;