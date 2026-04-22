import { createAsyncThunk } from "@reduxjs/toolkit";
import { getNotifications, markReadNotification } from "../../services/notification.api";

export const fetchNotifications = createAsyncThunk(
    "notification/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const data = await getNotifications();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const readNotification = createAsyncThunk(
    "notification/read",
    async (id, { rejectWithValue }) => {
        try {
            const data = await markReadNotification(id);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);