import { createSlice } from '@reduxjs/toolkit';
import { loginThunk, checkAuthThunk, logoutThunk } from '../../features/Authentication/auth.thunk';

const initialState = {
	user: null,
	userRole: null,
	userLocationId: null,
	allocation: null,
	locationId: 'loc_all',
	cameraId: 'cam_all',
	date: new Date().toISOString().split('T')[0],
	isAutoSelected: false,
};

const applyRoleFilterState = (state, role, locationId) => {
	if ((role === 'MANAGER' || role === 'USER') && locationId) {
		state.locationId = locationId;
		state.isAutoSelected = true;
		return;
	}

	if (role === 'ADMIN' || role === 'ADMIN_SUPER') {
		state.locationId = 'loc_all';
		state.isAutoSelected = false;
	}
};

const applyUserToState = (state, user, allocation) => {
	state.user = user;
	state.userRole = user?.role || null;
	state.userLocationId = user?.location_id || null;
	state.allocation = allocation || null;
	applyRoleFilterState(state, user?.role, user?.location_id);
};

const globalSlice = createSlice({
	name: 'filter',
	initialState,
	reducers: {
		setUser: (state, action) => {
			const { user, allocation } = action.payload || {};
			applyUserToState(state, user, allocation);
		},
		clearUser: (state) => {
			state.user = null;
			state.userRole = null;
			state.userLocationId = null;
			state.allocation = null;
		},
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
		initializeFilterByUserRole: (state, action) => {
			const { userRole, userLocationId } = action.payload;
			state.userRole = userRole;
			state.userLocationId = userLocationId;
			applyRoleFilterState(state, userRole, userLocationId);
		},
		resetFilter: (state) => {
			state.locationId = 'loc_all';
			state.cameraId = 'cam_all';
			state.date = new Date().toISOString().split('T')[0];
			state.isAutoSelected = false;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginThunk.fulfilled, (state, action) => {
				// Handle both old payload (just user) and new payload (user + allocation)
				const user = action.payload?.user || action.payload;
				const allocation = action.payload?.allocation || null;
				applyUserToState(state, user, allocation);
			})
			.addCase(checkAuthThunk.fulfilled, (state, action) => {
				// Handle both old payload (just user) and new payload (user + allocation)
				const user = action.payload?.user || action.payload;
				const allocation = action.payload?.allocation || null;
				applyUserToState(state, user, allocation);
			})
			.addCase(logoutThunk.fulfilled, (state) => {
				state.user = null;
				state.userRole = null;
				state.userLocationId = null;
				state.allocation = null;
				state.locationId = 'loc_all';
				state.cameraId = 'cam_all';
				state.isAutoSelected = false;
			})
			.addCase(loginThunk.rejected, (state) => {
				state.user = null;
				state.userRole = null;
				state.userLocationId = null;
				state.allocation = null;
			})
			.addCase(checkAuthThunk.rejected, (state) => {
				state.user = null;
				state.userRole = null;
				state.userLocationId = null;
				state.allocation = null;
			});
	},
});

export const {
	setUser,
	clearUser,
	setLocation,
	setCamera,
	setDate,
	initializeFilterByUserRole,
	resetFilter,
} = globalSlice.actions;

export default globalSlice.reducer;
