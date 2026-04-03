import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchGetMembers = createAsyncThunk(
    "memberSegmentation/fetchGetMembers",
    async (_, { rejectWithValue }) => {
        try {
            // Giả lập độ trễ mạng để hiệu ứng Loading hiện ra
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Trả về thành công nhưng data rỗng để Slice dùng dữ liệu Mock
            return { status: "success", data: [], meta: { total: 5 } }; 
        } catch (error) {
            return rejectWithValue("Lỗi hệ thống demo");
        }
    }
);

export const fetchGetSegments = createAsyncThunk(
    "memberSegmentation/fetchGetSegments",
    async (_, { rejectWithValue }) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { status: "success", data: [] };
        } catch (error) {
            return rejectWithValue("Lỗi tải phân cụm");
        }
    }
);
