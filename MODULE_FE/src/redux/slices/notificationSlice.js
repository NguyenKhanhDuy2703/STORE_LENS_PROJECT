import { createSlice } from '@reduxjs/toolkit';

const initialNotifications = [
  {
    id: 'n1',
    type: 'critical',
    title: 'Camera cửa vào mất kết nối',
    description: 'Hệ thống mất kết nối camera cửa chính lúc 10:15.',
    time: '2 phút trước',
    isRead: false,
    timestamp: Date.now() - 2 * 60 * 1000
  },
  {
    id: 'n2',
    type: 'warning',
    title: 'Cảnh báo mật độ cao',
    description: 'Khu vực B vượt ngưỡng sức chứa (25 người).',
    time: '15 phút trước',
    isRead: false,
    timestamp: Date.now() - 15 * 60 * 1000
  },
  {
    id: 'n3',
    type: 'info',
    title: 'Báo cáo ngày đã sẵn sàng',
    description: 'Báo cáo lượt khách và chuyển đổi đã sẵn sàng để tải xuống.',
    time: '1 giờ trước',
    isRead: true,
    timestamp: Date.now() - 60 * 60 * 1000
  },
  {
    id: 'n4',
    type: 'info',
    title: 'Cập nhật hệ thống hoàn tất',
    description: 'Tiến trình cập nhật dữ liệu phân tích đã thành công.',
    time: '3 giờ trước',
    isRead: true,
    timestamp: Date.now() - 3 * 60 * 60 * 1000
  },
  {
    id: 'n5',
    type: 'warning',
    title: 'Khách hàng tiềm năng rời đi',
    description: 'Khách hàng Premium Nguyễn Văn A có dấu hiệu ngừng hoạt động.',
    time: '5 giờ trước',
    isRead: false,
    timestamp: Date.now() - 5 * 60 * 60 * 1000
  },
  {
    id: 'n6',
    type: 'info',
    title: 'Camera mới được thêm',
    description: 'Camera khu vực C đã được cấu hình và hoạt động.',
    time: '1 ngày trước',
    isRead: true,
    timestamp: Date.now() - 24 * 60 * 60 * 1000
  }
];

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: initialNotifications,
    loading: false,
    error: null
  },
  reducers: {
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
    },
    deleteNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    }
  }
});

export const {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  addNotification,
  clearAllNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;