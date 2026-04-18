import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAssets, addOrUpdateAsset, deleteAsset, getMestricAssetByLocationID } from "../../services/asset.api";

const fetchAssets = createAsyncThunk(
  "asset/fetchAssets",
  async (params, { rejectWithValue }) => {
    try {
      const data = await getAssets(params);
      
      if (!data) {
        return rejectWithValue("Không nhận được dữ liệu từ server");
      }
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Lỗi khi lấy dữ liệu tài sản";
      return rejectWithValue(errorMessage);
    }
  }
);

const addOrUpdateAssetThunk = createAsyncThunk(
  "asset/addOrUpdateAsset",
  async (productData, { rejectWithValue }) => {
    try {
      const result = await addOrUpdateAsset(productData);
      if (!result) {
        return rejectWithValue("Không thể lưu sản phẩm");
      }

      return {
        productData,
        result
      }; 
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Lỗi khi lưu sản phẩm";
      return rejectWithValue(errorMessage);
    }
  }
);

const deleteAssetThunk = createAsyncThunk(
  "asset/deleteAsset",
  async ({locationId , assetId}, { rejectWithValue }) => {
    try {
        const result = await deleteAsset({ locationId, productId: assetId });
        if (!result) {
            return rejectWithValue("Không thể xóa sản phẩm");
        }
        return {
            locationId,
            assetId,
            result
        };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Lỗi khi xóa sản phẩm";
        return rejectWithValue(errorMessage);
    }
  }
);

const fetchAssetMetricThunk = createAsyncThunk(
  "asset/fetchAssetMetric",
  async (locationId, { rejectWithValue }) => {
    try {
      const data = await getMestricAssetByLocationID(locationId);

      if (!data) {
        return rejectWithValue("Không nhận được dữ liệu metric từ server");
      }

      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Lỗi khi lấy metric tài sản";
      return rejectWithValue(errorMessage);
    }
  }
);
    
export { fetchAssets, addOrUpdateAssetThunk, deleteAssetThunk, fetchAssetMetricThunk };
