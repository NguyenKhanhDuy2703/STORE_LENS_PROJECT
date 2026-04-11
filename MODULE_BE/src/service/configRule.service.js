const locationSchema = require("../schemas/location.schema");
const customerRuleSchema = require("../schemas/customerCareRule.schema");
const configRuleService = {
  async _preCheck({ locationId }) {
    const location = await locationSchema.findOne({
      location_code: locationId,
    });
    if (!location) {
      throw new Error("Location not found");
    }
  },
  async getConfigRules({ locationId }) {
    await this._preCheck({ locationId });
    const pipeline = [
      {
        $match: { location_id: locationId },
      },
      {
        $lookup: {
          from: "zones",
          localField: "zone_id",
          foreignField: "zone_id",
          as: "zone_detail",
        },
      },
      {
        $unwind: {
          path: "$zone_detail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          location_id: 1,
          category: 1,
          rule_id: 1,
          rule_name: 1,
          logic: 1,
          action: 1,
          is_active: 1,
          zone_id: 1,
          zone_name: "$zone_detail.zone_name",
        },
      },
    ];
    return await customerRuleSchema.aggregate(pipeline);
  },
  async createAndUpdateConfigRule({
    locationId,
    category,
    ruleName,
    ruleId,
    logic,
    action,
    isActive,
    zoneId,
  }) {
    await this._preCheck({ locationId });
    const result = await customerRuleSchema.updateOne(
      {
        location_id: locationId,
        rule_id: ruleId,
      },
      {
        $setOnInsert: {
          location_id: locationId,
          category: category,
          rule_id: ruleId,
        },
        $set: {
          rule_name: ruleName,
          logic: logic,
          action: action,
          is_active: isActive,
          zone_id: zoneId,
        },
      },
      {
        upsert: true,
      },
    );
    return result;
  },
  async deleteConfigRule({ locationId, ruleId }) {
    await this._preCheck({ locationId });
    const result = await customerRuleSchema.deleteOne({
      location_id: locationId,
      rule_id: ruleId,
    });
    return result;
  },
};
module.exports = configRuleService;
