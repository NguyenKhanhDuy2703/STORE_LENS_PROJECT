import { createSlice } from '@reduxjs/toolkit';
import { uploadPosExcelThunk } from './businessEvent.thunk';

const businessEventSlice = createSlice({
    name: 'businessEvent',
    initialState: {
        isUploading: false,
        uploadError: null,
    },
    reducers: {
        resetUploadState: (state) => {
            state.isUploading = false;
            state.uploadError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadPosExcelThunk.pending, (state) => {
                state.isUploading = true;
                state.uploadError = null;
            })
            .addCase(uploadPosExcelThunk.fulfilled, (state) => {
                state.isUploading = false;
            })
            .addCase(uploadPosExcelThunk.rejected, (state, action) => {
                state.isUploading = false;
                state.uploadError = action.payload || 'Upload thất bại';
            });
    },
});

export const { resetUploadState } = businessEventSlice.actions;
export default businessEventSlice.reducer;
