import { createAsyncThunk } from "@reduxjs/toolkit";
import { createCustomerRule, deleteCustomerRule, getCustomerRules } from "../../services/customerRules.api";
export const fetchCustomerRules = createAsyncThunk(
    "customerRules/fetch",
    async ({locationId}, { rejectWithValue }) => {
        try {
            const response = await getCustomerRules({ locationId });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addAndUpdateCustomerRule = createAsyncThunk(
    "customerRules/addOrUpdate",
    async ({ locationId, ruleData }, { rejectWithValue }) => { 
        try {
            const response = await createCustomerRule({ locationId, ruleData });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeCustomerRule = createAsyncThunk(
    "customerRules/remove",
    async ({ locationId, ruleId }, { rejectWithValue }) => { 
        try {
            const response = await deleteCustomerRule({ locationId, ruleId });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);