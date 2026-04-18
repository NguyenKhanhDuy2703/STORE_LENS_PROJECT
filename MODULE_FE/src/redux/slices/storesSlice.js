import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllStores } from "../../services/store.api";

/**
 * Thunk để fetch tất cả stores từ API
 */
export const fetchStores = createAsyncThunk(
  "stores/fetchStores",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllStores();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const storesSlice = createSlice({
  name: "stores",
  initialState: {
    items: [], // Danh sách cửa hàng
    isLoading: false,
    error: null,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.isLoading = false;
        // Đảm bảo action.payload.data là mảng stores
        state.items = action.payload.data || action.payload || [];
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default storesSlice.reducer;
