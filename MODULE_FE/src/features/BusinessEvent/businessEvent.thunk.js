import { createAsyncThunk } from '@reduxjs/toolkit';
import { uploadPosExcel } from '../../services/businessEvent.api';

export const uploadPosExcelThunk = createAsyncThunk(
    'businessEvent/uploadPosExcel',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await uploadPosExcel(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
