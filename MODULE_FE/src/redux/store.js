import { configureStore } from "@reduxjs/toolkit";
import memberSegmentationReducer from "../features/MemberSegmentation/member.slice";

const store = configureStore({
  reducer: {
    memberSegmentation: memberSegmentationReducer,
  },
});

export default store;