import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  locationId: 'LOC_TEST_001',
  cameraId: 'CAM_FRONT_057601',
  date: new Date().toISOString().split('T')[0]
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setLocation: (state, action) => {
      state.locationId = action.payload;
      state.cameraId = 'cam_all';
    },
    setCamera: (state, action) => {
      state.cameraId = action.payload;
    },
    setDate: (state, action) => {
      state.date = action.payload;
    }
  }
});

export const { setLocation, setCamera, setDate } = filterSlice.actions;
export default filterSlice.reducer;
