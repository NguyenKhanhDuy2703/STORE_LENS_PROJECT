import { createSlice } from "@reduxjs/toolkit";
import {
    fetchMemberSummary,
    fetchMemberDetail,
    saveMemberThunk,
    deleteMemberThunk
} from "./member.thunk";

const memberSlice = createSlice({
    name: "member",
    initialState: {
        metrics: { totalMembers: 0, newMembersThisMonth: 0, absenteeismRate: 0 },
        list: [],
        detail: null,
        loading: false,
        detailLoading: false,
        saving: false,
        error: null,
    },
    reducers: {
        clearDetail(state) {
            state.detail = null;
        },
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchSummary
            .addCase(fetchMemberSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMemberSummary.fulfilled, (state, action) => {
                state.loading = false;
                state.metrics = action.payload.metrics || state.metrics;
                state.list = action.payload.list || [];
            })
            .addCase(fetchMemberSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // fetchDetail
            .addCase(fetchMemberDetail.pending, (state) => {
                state.detailLoading = true;
            })
            .addCase(fetchMemberDetail.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.detail = action.payload;
            })
            .addCase(fetchMemberDetail.rejected, (state) => {
                state.detailLoading = false;
            })

            // save (upsert)
            .addCase(saveMemberThunk.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(saveMemberThunk.fulfilled, (state) => {
                state.saving = false;
            })
            .addCase(saveMemberThunk.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            // delete
            .addCase(deleteMemberThunk.fulfilled, (state, action) => {
                state.list = state.list.filter((m) => m.code !== action.payload);
            });
    }
});

export const { clearDetail, clearError } = memberSlice.actions;
export default memberSlice.reducer;
