import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios'; 
import { toast } from 'react-toastify';

/**
 * Thunk 1: Lấy danh sách chi tiết hội viên (Cho bảng MemberListInsights)
 */
export const fetchGetMembers = createAsyncThunk(
    "memberSegmentation/fetchGetMembers",
    async (locationId, { rejectWithValue }) => {
        try {
            // Gọi API thực tế từ Backend
            const response = await axios.get(`/api/v1/member/list`, {
                params: { location_id: locationId }
            });

            if (response.data.status === "success") {
                return response.data; 
            }
            return rejectWithValue(response.data.message);
        } catch (error) {
            const message = error.response?.data?.message || "Lỗi tải danh sách hội viên";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

/**
 * Thunk 2: Lấy dữ liệu phân cụm (Cho biểu đồ ClusterProfiles)
 */
export const fetchGetSegments = createAsyncThunk(
    "memberSegmentation/fetchGetSegments",
    async (locationId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/api/v1/member/segments`, {
                params: { location_id: locationId }
            });

            if (response.data.status === "success") {
                return response.data;
            }
            return rejectWithValue(response.data.message);
        } catch (error) {
            const message = error.response?.data?.message || "Lỗi tải dữ liệu phân cụm";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);