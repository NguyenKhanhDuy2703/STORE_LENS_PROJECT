import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    getMemberSummary,
    getMemberDetail,
    saveMember,
    deleteMember
} from "../../services/member.api";

export const fetchMemberSummary = createAsyncThunk(
    "member/fetchSummary",
    async ({ locationId, search, status }, { rejectWithValue }) => {
        try {
            return await getMemberSummary({ locationId, search, status });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchMemberDetail = createAsyncThunk(
    "member/fetchDetail",
    async ({ locationId, memberCode }, { rejectWithValue }) => {
        try {
            return await getMemberDetail({ locationId, memberCode });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const saveMemberThunk = createAsyncThunk(
    "member/save",
    async ({ locationId, memberData }, { rejectWithValue }) => {
        try {
            return await saveMember({ locationId, memberData });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteMemberThunk = createAsyncThunk(
    "member/delete",
    async ({ locationId, memberCode }, { rejectWithValue }) => {
        try {
            await deleteMember({ locationId, memberCode });
            return memberCode;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
