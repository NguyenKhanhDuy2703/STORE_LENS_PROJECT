import { createAsyncThunk } from '@reduxjs/toolkit';
import {
	getCameraDashboardData,
	upsertCamera,
	deleteCamera,
	turnOnCamera,
	turnOffCamera,
} from '../../services/camera.api';

const getErrorMessage = (error, fallback) => {
	return error?.response?.data?.message || error?.message || fallback;
};

export const fetchCameraDashboardThunk = createAsyncThunk(
	'camera/fetchDashboard',
	async (locationId, { rejectWithValue }) => {
		try {
			const response = await getCameraDashboardData(locationId);
			const payload = response?.data || response;
			return {
				metrics: payload?.metrics || { total: 0, active: 0, error: 0 },
				cameraList: payload?.camera_list || [],
				lastUpdated: payload?.last_updated || null,
			};
		} catch (error) {
			return rejectWithValue(getErrorMessage(error, 'Không thể tải dữ liệu camera'));
		}
	}
);

export const upsertCameraThunk = createAsyncThunk(
	'camera/upsert',
	async ({ cameraCode, cameraData }, { rejectWithValue }) => {
		try {
			const response = await upsertCamera(cameraCode, cameraData);
			const responseData = response?.data || response;

			return {
				...cameraData,
				...responseData,
				camera_code:
					responseData?.camera_code ||
					responseData?.cameraCode ||
					cameraData?.camera_code ||
					cameraData?.cameraCode ||
					cameraCode,
			};
		} catch (error) {
			return rejectWithValue(getErrorMessage(error, 'Không thể lưu camera'));
		}
	}
);

export const deleteCameraThunk = createAsyncThunk(
	'camera/delete',
	async (cameraCode, { rejectWithValue }) => {
		try {
			const response = await deleteCamera(cameraCode);
			return { cameraCode, result: response?.data || response };
		} catch (error) {
			return rejectWithValue(getErrorMessage(error, 'Không thể xóa camera'));
		}
	}
);

export const turnOnCameraThunk = createAsyncThunk(
	'camera/turnOn',
	async ({ cameraCode, urlRtsp, locationId }, { rejectWithValue }) => {
		try {
			const response = await turnOnCamera({
				cameraCode,
				urlRtsp,
				locationId,
			});
			return {
				cameraCode,
				result: response?.data || response,
			};
		} catch (error) {
			return rejectWithValue(getErrorMessage(error, 'Không thể bật camera'));
		}
	}
);

export const turnOffCameraThunk = createAsyncThunk(
	'camera/turnOff',
	async ({ cameraCode, urlRtsp }, { rejectWithValue }) => {
		try {
			const response = await turnOffCamera(urlRtsp);
			return {
				cameraCode,
				result: response?.data || response,
			};
		} catch (error) {
			return rejectWithValue(getErrorMessage(error, 'Không thể tắt camera'));
		}
	}
);
