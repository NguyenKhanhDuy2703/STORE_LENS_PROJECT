import { createSlice } from "@reduxjs/toolkit";
import {
  loginThunk,
  checkAuthThunk,
  registerThunk,
  logoutThunk
} from "./auth.thunk";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    allocation: null,
    isLogin: false,
    loading: true,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(checkAuthThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isLogin = true;
        state.user = action.payload?.user || action.payload;
        state.allocation = action.payload?.allocation || null;
        state.error = null;
      })
      .addCase(checkAuthThunk.rejected, (state, action) => {
        state.loading = false;
        state.isLogin = false;
        state.user = null;
        state.allocation = null;
        state.error = action.payload || action.error?.message || "Session expired or invalid token";
      })

      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isLogin = true;
        // Handle both old payload (just user) and new payload (user + allocation)
        state.user = action.payload?.user || action.payload;
        state.allocation = action.payload?.allocation || null;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.isLogin = false;
        state.user = null;
        state.allocation = null;
        state.error = action.payload || action.error?.message || "Failed to login";
      })

      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to signup";
      })

      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.allocation = null;
        state.isLogin = false;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.allocation = null;
        state.isLogin = false;
        state.error = action.payload || action.error?.message || "Failed to logout";
      });
  },
});

export default authSlice.reducer;