import { createSlice } from "@reduxjs/toolkit";
import { fetchNotifications, readNotification } from "./notification.thunk";

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        data: [],
        unreadCount: 0,
        loading: false,
        error: null,
    },

    reducers: {
        // Thêm alert realtime từ socket vào đầu danh sách — không cần refetch
        addRealtimeAlert(state, action) {
            const newAlert = action.payload;
            if (!newAlert) return;
            // Tránh duplicate — check cả _id và message+created_at
            const exists = state.data.some(
                (n) => n._id === newAlert._id ||
                       (n.message === newAlert.message && n.created_at === newAlert.created_at)
            );
            if (!exists) {
                state.data = [newAlert, ...state.data];
                state.unreadCount += 1;
            }
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                // Merge: ưu tiên data từ API, giữ lại item từ socket chưa có trong DB
                const apiData = action.payload ?? [];
                const apiIds = new Set(apiData.map((n) => n._id).filter(Boolean));
                const socketOnly = state.data.filter((n) => n._id && !apiIds.has(n._id));
                state.data = [...socketOnly, ...apiData];
                state.unreadCount = state.data.filter((n) => !n.is_read).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(readNotification.fulfilled, (state, action) => {
                const id = action.payload;
                state.data = state.data.map((item) =>
                    item._id === id ? { ...item, is_read: true } : item
                );
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            });
    },
});

export const { addRealtimeAlert } = notificationSlice.actions;
export default notificationSlice.reducer;
