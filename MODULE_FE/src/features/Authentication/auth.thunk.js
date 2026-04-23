import { createAsyncThunk } from "@reduxjs/toolkit";
import { login, signup, logout, getProfile } from "../../services/auth.api";
import { getLocationAllocationById } from "../../services/location.api";

const getErrorMessage = (error, fallbackMessage) =>
    error?.message || fallbackMessage;

const resolveUser = (sessionPayload) => {
    if (!sessionPayload) {
        return null;
    }

    if (sessionPayload.user) {
        return sessionPayload.user;
    }

    return sessionPayload;
};

export const loginThunk = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            await login(credentials);
            const session = await getProfile();
            const user = resolveUser(session);

            if (!user) {
                throw new Error("Cannot resolve authenticated user after login");
            }

            // Fetch allocation info for the user's location if location_id exists
            let allocation = null;
            if (user.location_id) {
                try {
                    allocation = await getLocationAllocationById(user.location_id);
                } catch (allocationError) {
                    console.warn("Failed to fetch allocation info, continuing without it:", allocationError);
                    // Don't fail the login if allocation fetch fails
                }
            }

            return { user, allocation };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to login"));
        }
    }
);

export const checkAuthThunk = createAsyncThunk(
    "auth/checkAuth",
    async (_, { rejectWithValue }) => {
        try {
            const session = await getProfile();
            const user = resolveUser(session);

            if (!user) {
                throw new Error("Session is empty");
            }

            // Fetch allocation info for the user's location if location_id exists
            let allocation = null;
            if (user.location_id) {
                try {
                    allocation = await getLocationAllocationById(user.location_id);
                } catch (allocationError) {
                    console.warn("Failed to fetch allocation info, continuing without it:", allocationError);
                    // Don't fail the session check if allocation fetch fails
                }
            }

            return { user, allocation };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Session expired or invalid token"));
        }
    }
);

export const registerThunk = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            return await signup(userData);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to signup"));
        }
    }
);

export const logoutThunk = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await logout();
            return null;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to logout"));
        }
    }
);

export const loginUser = loginThunk;
export const fetchCurrentUser = checkAuthThunk;
export const registerUser = registerThunk;
export const logoutUser = logoutThunk;