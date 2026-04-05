import { createSlice } from "@reduxjs/toolkit";
import { fetchGetMembers, fetchGetSegments } from "./member.thunk";

const initialState = {
    members: [
        { _id: "USR-9928", member_code: "9928", name: "Nguyễn Văn A", segment_name: "Khách thân thiết", chest_shoulder: 10, back: 10, legs_glutes: 10, visits_per_month: 18, dwell_time: "48 phút", note: "Buổi tập ổn định, duy trì phong độ." },
        { _id: "USR-7654", member_code: "7654", name: "Trần Thị B", segment_name: "Khách thân thiết", chest_shoulder: 15, back: 10, legs_glutes: 15, visits_per_month: 15, dwell_time: "52 phút", note: "Buổi tập ổn định, duy trì phong độ." },
        { _id: "USR-3421", member_code: "3421", name: "Lê Văn C", segment_name: "Khách vãng lai", chest_shoulder: 0, back: 20, legs_glutes: 0, visits_per_month: 5, dwell_time: "28 phút", note: "Cần giữ thói quen đều đặn hơn trong tuần." },
        { _id: "USR-8891", member_code: "8891", name: "Phạm Thị D", segment_name: "Khách tiềm năng", chest_shoulder: 5, back: 10, legs_glutes: 5, visits_per_month: 7, dwell_time: "22 phút", note: "Buổi tập hiệu quả, tiềm năng chuyển đổi cao." },
        { _id: "USR-4409", member_code: "4409", name: "Hoàng Văn E", segment_name: "Khách vãng lai", chest_shoulder: 10, back: 15, legs_glutes: 0, visits_per_month: 4, dwell_time: "32 phút", note: "Cần duy trì thói quen đều đặn hơn trong tuần." }
    ],
    segments: [
        { _id: "s1", segment_name: "Khách thân thiết", member_count: 2, avg_spend: 18000000, description: "Tương tác cao, giá trị lớn." },
        { _id: "s2", segment_name: "Khách vãng lai", member_count: 2, avg_spend: 7200000, description: "Thỉnh thoảng quay lại." },
        { _id: "s3", segment_name: "Khách tiềm năng", member_count: 1, avg_spend: 5000000, description: "Mới tham gia, tiềm năng phát triển." }
    ],
    loading: false,
    error: null
};

const memberSlice = createSlice({
    name: "memberSegmentation",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGetMembers.pending, (state) => { 
                state.loading = true; 
                state.error = null;
            })
            .addCase(fetchGetMembers.fulfilled, (state, action) => {
                state.loading = false;
                // Chỉ ghi đè nếu BE trả về dữ liệu thật (action.payload.data.length > 0)
                if (action.payload?.data?.length > 0) {
                    state.members = action.payload.data;
                }
            })
            .addCase(fetchGetMembers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload|| "Không thể tải danh sách hội viên";
            })
            .addCase(fetchGetSegments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGetSegments.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.data?.length > 0) {
                    state.segments = action.payload.data;
                }
            })
            .addCase(fetchGetSegments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Không thể tải dữ liệu phân cụm";
            });
    }
});

export const { clearError } = memberSlice.actions;
export default memberSlice.reducer;