const configRuleService = require("../service/configRule.service")
const catchAsync = require("../utils/catchAsync");
const { error, success } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

const getConfigRuleController = catchAsync(async (req , res) => {
    const { locationId } = req.query;
    if(!locationId){
        return error({
            res,
            message: "Missing required parameters",
            code: StatusCodes.BAD_REQUEST,
        })
    }
    const configRules = await configRuleService.getConfigRules({ locationId });
    success({
        res,
        message: "Get config rules successfully",
        code: StatusCodes.OK,
        data: configRules,
    })
}
);
const createAndUpdateConfigRuleController = catchAsync(async (req , res) => {
    const { listRules } = req.body;
   
    if(!listRules || !Array.isArray(listRules) ){
        return error({
            res,
            message: "Invalid listRules parameter",
            code: StatusCodes.BAD_REQUEST,
        })
    }
    const results = await Promise.allSettled(listRules.map( rule => {
        return configRuleService.createAndUpdateConfigRule({
            locationId : rule.locationId,
            category : rule.category,
            ruleName : rule.ruleName,
            ruleId : rule.ruleId,
            logic : rule.logic,
            action : rule.action,
            isActive : rule.isActive,
            zoneId : rule.zoneId,
        })
    }))
    if(results.some(result => result.status === "rejected")){
        const message = results.filter(result => result.status === "rejected").map(result => result.reason.message);

        return error({
            res,
            message: message,
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        })
    }
   
    success({
        res,
        message: "Create or update config rule successfully",
        code: StatusCodes.OK,
        data: {
            total: listRules.length,
            results,
        },
    })
}
);
const deleteConfigRuleController = catchAsync(async (req , res) => {
    const { locationId , ruleId } = req.query;
    if(!locationId){
        return error({
            res,
            message: "Missing required parameters",
            code: StatusCodes.BAD_REQUEST,
        })
    }
    const result = await configRuleService.deleteConfigRule({ locationId , ruleId});
    success({
        res,
        message: "Delete config rule successfully",
        code: StatusCodes.OK,
        data: result,
    })
}
);
module.exports = {
    getConfigRuleController,
    createAndUpdateConfigRuleController,
    deleteConfigRuleController,
}