import { createAsyncThunk } from "@reduxjs/toolkit";
import { getLocationAllocationById } from "../../services/location.api";
export const getAllocationById = createAsyncThunk(
  "location/getById",
  async (locationId, { rejectWithValue }) => {
    try {
        if (!locationId) {
          return rejectWithValue("Location ID is required");
        }

        const allocation = await getLocationAllocationById(locationId);
        return allocation;
    }
    catch (error) {
        return rejectWithValue(error.message || "Failed to fetch location allocation");
    }
  }
);