import { createAsyncThunk } from "@reduxjs/toolkit";
import { getNotifications, markReadNotification } from "../../services/notification.api";

// Lấy locationId từ global filter để đồng bộ với toàn bộ web
export const fetchNotifications = createAsyncThunk(
    "notification/fetchAll",
    async (_, { getState, rejectWithValue }) => {
        try {
            const { locationId, userLocationId } = getState().filter;
            // Dùng cùng logic với các trang khác: nếu loc_all thì dùng userLocationId
            const effectiveLocationId = locationId !== "loc_all" ? locationId : userLocationId;
            const data = await getNotifications(effectiveLocationId);
            return data ?? [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const readNotification = createAsyncThunk(
    "notification/read",
    async (id, { rejectWithValue }) => {
        try {
            await markReadNotification(id);
            return id; // trả về id để slice cập nhật is_read
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
