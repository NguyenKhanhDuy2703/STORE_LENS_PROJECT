import { createAsyncThunk } from "@reduxjs/toolkit";
import { getListZone , createAndUpdateZone , deleteZone } from "../../services/zone.api";
import { getCameraDashboardData } from "../../services/camera.api";

export const fetchListZone = createAsyncThunk(
  "cameraZone/fetchList",
  async ({ locationId, cameraCode }, { rejectWithValue }) => {
    try {
        
        const responseData = await getListZone({ locationId , cameraCode });
        return responseData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const fetchCreateAndUpdateZone = createAsyncThunk(
    "cameraZone/createAndUpdate",
    async ({ locationId , cameraCode , listZones , imgUrl }, { rejectWithValue }) => {
        try {
            const response = await createAndUpdateZone({ locationId , cameraCode , listZones , imgUrl });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchDeleteZone = createAsyncThunk(
    "cameraZone/delete",
    async ({ locationId , cameraCode , zoneId }, { rejectWithValue }) => {
        try {
            const response = await deleteZone({ locationId , cameraCode , zoneId });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

