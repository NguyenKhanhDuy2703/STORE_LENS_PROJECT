import { createSlice } from "@reduxjs/toolkit";
import { fetchAssets, addOrUpdateAssetThunk, fetchAssetMetricThunk } from "./asset.thunk";

const initialState = {
  listAsset: [],       
  isLoading: false,    
  error: null,         
  total: 0,            
  page: 1,            
  isSaving: false,     
  saveError: null,     
  successMessage: null, 
  editingProduct: null, 
  metric: {
    totalProduct: 0,
    activeProduct: 0,
    outOfStockProduct: 0,
    totalInventoryValue: 0,
  },
  metricLoading: false,
  metricError: null,
};

const assetSlice = createSlice({
  name: "asset",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAssetState: (state) => {
      return initialState;
    },

    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setEditingProduct: (state, action) => {
      state.editingProduct = action.payload;
    },
    updateEditingProduct: (state, action) => {
      if (state.editingProduct) {
        state.editingProduct = { ...state.editingProduct, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    
    builder.addCase(fetchAssets.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(fetchAssets.fulfilled, (state, action) => {
      state.isLoading = false;
      state.listAsset = action.payload.listAsset || [];
      state.total = action.payload.total || 0;
      state.error = null;
    });
    
    builder.addCase(fetchAssets.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Lỗi không xác định";
      state.listAsset = [];
    });

    builder.addCase(addOrUpdateAssetThunk.pending, (state) => {
      state.isSaving = true;
      state.saveError = null;
      state.successMessage = null;
    });

    builder.addCase(addOrUpdateAssetThunk.fulfilled, (state, action) => {
      state.isSaving = false;
      state.successMessage = "Lưu sản phẩm thành công!";
      state.saveError = null;
      state.editingProduct = null;

      const { productData } = action.payload;
      const existingIndex = state.listAsset.findIndex(
        (item) => item.product_id === productData.product_id
      );

      if (existingIndex !== -1) {
        state.listAsset[existingIndex] = { ...state.listAsset[existingIndex], ...productData };
      } else {
        state.listAsset.unshift({
          ...productData,
          _id: new Date().getTime().toString() 
        });
      }
    });
    builder.addCase(addOrUpdateAssetThunk.rejected, (state, action) => {
      state.isSaving = false;
      state.saveError = action.payload || "Lỗi khi lưu sản phẩm";
      state.successMessage = null;
    });

    builder.addCase(fetchAssetMetricThunk.pending, (state) => {
      state.metricLoading = true;
      state.metricError = null;
    });

    builder.addCase(fetchAssetMetricThunk.fulfilled, (state, action) => {
      state.metricLoading = false;
      state.metric = {
        totalProduct: action.payload.totalProduct || 0,
        activeProduct: action.payload.activeProduct || 0,
        outOfStockProduct: action.payload.outOfStockProduct || 0,
        totalInventoryValue: action.payload.totalInventoryValue || 0,
      };
      state.metricError = null;
    });

    builder.addCase(fetchAssetMetricThunk.rejected, (state, action) => {
      state.metricLoading = false;
      state.metricError = action.payload || "Lỗi không xác định khi lấy metric";
    });
  },
});


export const {
  clearError,
  resetAssetState,
  clearSuccessMessage,
  setEditingProduct,
  updateEditingProduct
} = assetSlice.actions;

export default assetSlice.reducer;
