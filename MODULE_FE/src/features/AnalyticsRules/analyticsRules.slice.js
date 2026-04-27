import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCustomerRules,
  addAndUpdateCustomerRule
} from "./analyticsRules.thunk";
const rulehelper = (rule) => {
    return {
        locationId:  rule.location_id,
        category: rule.category,
        ruleName:  rule.rule_name,
        ruleId:  rule.rule_id,
        logic: {
          metricName: rule.logic?.metric_name,
          operator: rule.logic?.operator,
          threshold: rule.logic?.threshold,
          unit: rule.logic?.unit,
        },
        zoneName: rule.zone_name,
        action: rule.action,
        isActive: typeof rule.is_active === "boolean" ? rule.is_active : Boolean(rule.isActive),
        createdAt: rule.created_at || rule.createdAt,
    }
}
const customerRuleSlice = createSlice({
  initialState: {
    rules: [],
    loading: false,
    error: null,
  },
  name: "customerRule",
  reducers: {
    addAndUpdateRule : (state, action) => {
        const ruleData = action.payload;
        console.log("Adding/updating rule in slice:", ruleData);
        const existingRuleIndex = state.rules.findIndex(r => r.ruleId === ruleData.ruleId);
        if (existingRuleIndex !== -1) {
        state.rules[existingRuleIndex] = ruleData;
        } else {
        state.rules.push(ruleData);
        }
    },
    deleteRule : (state, action) => {
        const ruleId = action.payload;
        state.rules = state.rules.filter(rule => rule.ruleId !== ruleId);
    },
    toggleRule : (state, action) => {
        const ruleId = action.payload;
        const ruleIndex = state.rules.findIndex(r => r.ruleId === ruleId);
        if (ruleIndex !== -1) {
            state.rules[ruleIndex].isActive = !state.rules[ruleIndex].isActive;
        }
    }

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerRules.fulfilled, (state, action) => {
        state.loading = false;
        state.rules = Array.isArray(action.payload) ? action.payload.map(rulehelper) : [];
      })
      .addCase(fetchCustomerRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch customer rules.";
      });
  },

});
export const { addAndUpdateRule , deleteRule  , toggleRule} = customerRuleSlice.actions;
export default customerRuleSlice.reducer;
