import { createSlice } from '@reduxjs/toolkit';
import {
	fetchCameraDashboardThunk,
	upsertCameraThunk,
	deleteCameraThunk,
	turnOnCameraThunk,
	turnOffCameraThunk,
} from './camera.thunk';

const initialState = {
	metrics: {
		total: 0,
		active: 0,
		error: 0,
	},
	cameras: [],
	lastUpdated: null,
	loading: false,
	error: null,
	saving: false,
	saveError: null,
	deleting: false,
	deleteError: null,
	toggling: false,
	togglingCameraCode: null,
	toggleError: null,
};

const cameraSlice = createSlice({
	name: 'camera',
	initialState,
	extraReducers: (builder) => {
		builder
			.addCase(fetchCameraDashboardThunk.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCameraDashboardThunk.fulfilled, (state, action) => {
				state.loading = false;
				state.metrics = action.payload.metrics;
				state.cameras = action.payload.cameraList;
				state.lastUpdated = action.payload.lastUpdated;
			})
			.addCase(fetchCameraDashboardThunk.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || action.error.message;
			})
			.addCase(upsertCameraThunk.pending, (state) => {
				state.saving = true;
				state.saveError = null;
			})
			.addCase(upsertCameraThunk.fulfilled, (state, action) => {
				state.saving = false;

				const updatedCamera = action.payload;
				if (!updatedCamera || typeof updatedCamera !== 'object') return;

				const updatedCameraCode =
					updatedCamera.camera_code || updatedCamera.cameraCode || updatedCamera.id;
				if (!updatedCameraCode) return;

				const cameraIndex = state.cameras.findIndex((camera) => {
					const cameraCode = camera.camera_code || camera.cameraCode || camera.id;
					return cameraCode === updatedCameraCode;
				});

				if (cameraIndex >= 0) {
					state.cameras[cameraIndex] = {
						...state.cameras[cameraIndex],
						...updatedCamera,
					};
					return;
				}

				state.cameras.unshift(updatedCamera);
				state.metrics.total += 1;
			})
			.addCase(upsertCameraThunk.rejected, (state, action) => {
				state.saving = false;
				state.saveError = action.payload || action.error.message;
			})
			.addCase(deleteCameraThunk.pending, (state) => {
				state.deleting = true;
				state.deleteError = null;
			})
			.addCase(deleteCameraThunk.fulfilled, (state, action) => {
				state.deleting = false;
				state.cameras = state.cameras.filter((camera) => camera.camera_code !== action.payload.cameraCode);
				state.metrics.total = Math.max(0, state.metrics.total - 1);
			})
			.addCase(deleteCameraThunk.rejected, (state, action) => {
				state.deleting = false;
				state.deleteError = action.payload || action.error.message;
			})
			.addCase(turnOnCameraThunk.pending, (state, action) => {
				state.toggling = true;
				state.toggleError = null;
				state.togglingCameraCode = action.meta.arg?.cameraCode || null;
			})
			.addCase(turnOnCameraThunk.fulfilled, (state, action) => {
				state.toggling = false;
				state.togglingCameraCode = null;
				// Cập nhật status camera trong Redux ngay lập tức
				const cameraCode = action.payload?.cameraCode;
				if (cameraCode) {
					const cam = state.cameras.find((c) => (c.camera_code || c.id) === cameraCode);
					if (cam) cam.status = 'active';
				}
			})
			.addCase(turnOnCameraThunk.rejected, (state, action) => {
				state.toggling = false;
				state.togglingCameraCode = null;
				state.toggleError = action.payload || action.error.message;
			})
			.addCase(turnOffCameraThunk.pending, (state, action) => {
				state.toggling = true;
				state.toggleError = null;
				state.togglingCameraCode = action.meta.arg?.cameraCode || null;
			})
			.addCase(turnOffCameraThunk.fulfilled, (state, action) => {
				state.toggling = false;
				state.togglingCameraCode = null;
				// Cập nhật status camera trong Redux ngay lập tức
				const cameraCode = action.payload?.cameraCode;
				if (cameraCode) {
					const cam = state.cameras.find((c) => (c.camera_code || c.id) === cameraCode);
					if (cam) cam.status = 'inactive';
				}
			})
			.addCase(turnOffCameraThunk.rejected, (state, action) => {
				state.toggling = false;
				state.togglingCameraCode = null;
				state.toggleError = action.payload || action.error.message;
			});
	},
});

export default cameraSlice.reducer;
