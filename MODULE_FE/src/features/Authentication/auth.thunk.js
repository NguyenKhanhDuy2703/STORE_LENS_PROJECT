import { createAsyncThunk } from "@reduxjs/toolkit";
import { login, signup, logout, getToken } from "../../services/authen.api"; // Đường dẫn tới file service của bạn

// 1. Thunk xử lý Đăng nhập
export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            // credentials bao gồm { account, password }
            const response = await login(credentials);
            // Lưu ý: service đã return response.data nên ở đây ta nhận được object data luôn
            return response.data; 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 2. Thunk xử lý Đăng ký
export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            // userData bao gồm { account, password, email, location_id, fullname }
            const response = await signup(userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 3. Thunk xử lý Đăng xuất
export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            const response = await logout();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 4. Thunk kiểm tra trạng thái Token (Dùng khi F5 hoặc bắt đầu vào App)
export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getToken();
            // Trả về thông tin user từ token hợp lệ
            return response.data; 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);