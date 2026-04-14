import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  locationId: 'loc_all',
  cameraId: 'cam_all',
  date: new Date().toISOString().split('T')[0],
  // Role-based filter controls
  userRole: null,
  userLocationId: null, // user.location_id from auth
  isAutoSelected: false, // Track if default was auto-selected
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
    },
    // Initialize filter based on user role and location
    initializeFilterByUserRole: (state, action) => {
      const { userRole, userLocationId } = action.payload;
      state.userRole = userRole;
      state.userLocationId = userLocationId;
      
      // Auto-select for MANAGER and USER roles
      if ((userRole === 'MANAGER' || userRole === 'USER') && userLocationId) {
        state.locationId = userLocationId;
        state.isAutoSelected = true;
      } else if (userRole === 'ADMIN_SUPER') {
        // ADMIN_SUPER can select all
        state.locationId = 'loc_all';
      }
    },
    // Reset filter to initial state
    resetFilter: (state) => {
      state.locationId = 'loc_all';
      state.cameraId = 'cam_all';
      state.date = new Date().toISOString().split('T')[0];
      state.isAutoSelected = false;
    },
  }
});

export const { 
  setLocation, 
  setCamera, 
  setDate,
  initializeFilterByUserRole,
  resetFilter 
} = filterSlice.actions;
export default filterSlice.reducer;
