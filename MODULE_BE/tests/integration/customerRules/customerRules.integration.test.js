const buildCreateCustomerRulesPayload = ({ ruleSuffix = Date.now().toString() }) => ({
    listRules: [
        {
            category: 'retention',
            ruleName: 'High Returning Customers',
            ruleId: `RULE_${ruleSuffix}`,
            logic: {
                metric_name: 'visit_count',
                operator: '>=',
                threshold: 3,
                unit: 'times',
            },
            action: {
                type_action: 'notify',
                message_template: 'Customer has returned frequently',
            },
            is_active: true,
        },
    ],
});

const buildCustomerRuleItem = ({
    category = 'retention',
    ruleName,
    ruleId,
    threshold = 3,
    isActive = true,
}) => ({
    category,
    ruleName,
    ruleId,
    logic: {
        metric_name: 'visit_count',
        operator: '>=',
        threshold,
        unit: 'times',
    },
    action: {
        type_action: 'notify',
        message_template: `${ruleName} message`,
    },
    is_active: isActive,
});

const buildCustomerRulesBulkPayload = ({ listRules }) => ({
    listRules,
});

module.exports = {
    buildCreateCustomerRulesPayload,
    buildCustomerRuleItem,
    buildCustomerRulesBulkPayload,
};
