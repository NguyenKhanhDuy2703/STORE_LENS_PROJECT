import { createSlice } from "@reduxjs/toolkit";
import { fetchNotifications, readNotification } from "./notification.thunk";

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        data: [],
        loading: false,
        error: null
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(readNotification.fulfilled, (state, action) => {
                const id = action.payload;
                state.data = state.data.map(item =>
                    item._id === id
                        ? { ...item, is_read: true }
                        : item
                );
            });
    }
});

export default notificationSlice.reducer;