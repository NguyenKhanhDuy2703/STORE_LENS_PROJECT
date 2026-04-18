import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  logoutUser
} from "./auth.thunk";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    // user sẽ chứa đầy đủ: account, email, role, location_id từ DB
    user: null, 
    isLoading: false,
    isLogin: false,        
    error: null,
  },

  reducers: {
    // Reducer để xóa lỗi khi người dùng chuyển trang hoặc nhập lại
    clearError: (state) => {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder
      // --- LOGIN ---
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLogin = true;
        state.user = action.payload.user; // Lưu toàn bộ thông tin user từ DB
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isLogin = false;
        state.error = action.payload;
      })

      // --- SIGNUP (Đăng ký) ---
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Thường đăng ký xong sẽ tự login hoặc bắt login lại
        // Ở đây ta lưu user mới nếu backend trả về luôn
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // --- LOGOUT ---
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLogin = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;