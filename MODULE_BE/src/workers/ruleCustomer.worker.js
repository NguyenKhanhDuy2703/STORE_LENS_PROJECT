const CustomerCareRule = require("../schemas/customerCareRule.schema");
const Customer = require("../schemas/customer.schema");
const Notification = require("../schemas/notification.schema");
const logger = require("../utils/logging");

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Cooldown 5 phút — tránh spam notification cho cùng 1 người tại cùng 1 zone
// Lý do: AI gửi ping mỗi frame (~30fps), 5 phút đủ để staff xử lý
const ZONE_ALERT_COOLDOWN_MS = 0.5 * 60 * 1000;

// In-memory cooldown store: key = "locationId:trackId:ruleId" → timestamp lần alert cuối
const _zoneCooldownMap = new Map();

/**
 * Worker xử lý rule chăm sóc khách hàng theo location.
 * Được trigger mỗi khi gọi API.
 *
 * Luồng:
 *  1. Lấy rule active theo location_id + category
 *  2. Lấy danh sách customer của location
 *  3. Với mỗi cặp (customer, rule): tính metric → so sánh → tạo notification nếu đạt
 */
const ruleCustomerWorker = {

    // Tính giá trị thực tế của customer theo tên metric trong rule
    // Trả về null nếu metric không tính được (vd: chưa có lastVisit)
    _getMetricValue(customer, metricName) {
        const now = Date.now();

        switch (metricName) {
            // Tổng số lượt khách đã tới
            case "total_sessions":
                return customer.totalSessions ?? 0;

            // Số ngày kể từ lần ghé cuối
            case "days_since_last_visit":
                if (!customer.lastVisit) return null;
                return Math.floor((now - new Date(customer.lastVisit).getTime()) / MS_PER_DAY);

            // Số ngày kể từ ngày tham gia
            case "days_since_join":
                if (!customer.joinDate) return null;
                return Math.floor((now - new Date(customer.joinDate).getTime()) / MS_PER_DAY);

            // Số lượt ghé trong 30 ngày gần nhất (đếm từ history[])
            case "visits_last_30_days": {
                if (!Array.isArray(customer.history)) return 0;
                const cutoff = new Date(now - 30 * MS_PER_DAY);
                return customer.history.filter(
                    (h) => h.date && new Date(h.date) >= cutoff
                ).length;
            }

            default:
                logger.warn(`[ruleCustomer] Unsupported metric: ${metricName}`);
                return null;
        }
    },

    // So sánh giá trị thực tế với threshold theo operator của rule
    _evaluate(value, operator, threshold) {
        switch (operator) {
            case ">":  return value > threshold;
            case "<":  return value < threshold;
            case ">=": return value >= threshold;
            case "<=": return value <= threshold;
            default:
                logger.warn(`[ruleCustomer] Unsupported operator: ${operator}`);
                return false;
        }
    },

    // Tạo notification khi customer đạt điều kiện của rule
    // retention/revenue → NORMAL (thông báo chăm sóc, không khẩn cấp)
    async _createNotification(rule, locationId, customer) {
        try {
            await Notification.create({
                location_id: locationId,
                rule_id:     rule.rule_id,
                type:        rule.category.toUpperCase(), // "RETENTION" | "REVENUE"
                title:       "NORMAL",
                // Gắn tên + SĐT khách vào message để staff biết cần liên hệ ai
                message:     `${rule.action} | ${customer.name} (${customer.phone})`,
                is_read:     false,
            });

            logger.info(
                `[ruleCustomer] Notification created | rule=${rule.rule_id} | customer=${customer.code}`
            );
        } catch (err) {
            logger.error(`[ruleCustomer] Failed to create notification: ${err.message}`);
        }
    },

    // Kiểm tra rule retention — phát hiện khách có nguy cơ churn hoặc cần chăm sóc lại
    // Ví dụ: days_since_last_visit > 30 → khách chưa ghé hơn 30 ngày
    async checkRetentionRules({ location_id }) {
        const rules = await CustomerCareRule.find({
            location_id,
            category: "retention",
            is_active: true,
        }).lean();

        if (rules.length === 0) {
            logger.info(`[ruleCustomer] No active retention rules for location=${location_id}`);
            return;
        }

        // Chỉ lấy customer ACTIVE để kiểm tra retention
        const customers = await Customer.find({
            locationId: location_id,
            status: "ACTIVE",
        }).lean();

        if (customers.length === 0) return;

        logger.info(
            `[ruleCustomer] Checking retention | rules=${rules.length} | customers=${customers.length}`
        );

        for (const customer of customers) {
            for (const rule of rules) {
                // Hỗ trợ cả snake_case (metric_name) và camelCase (metricName)
                const metricName = rule.logic?.metric_name || rule.logic?.metricName;
                const { operator, threshold } = rule.logic;

                const actualValue = this._getMetricValue(customer, metricName);

                // Bỏ qua nếu không tính được metric
                if (actualValue === null) continue;

                if (this._evaluate(actualValue, operator, threshold)) {
                    await this._createNotification(rule, location_id, customer);
                }
            }
        }
    },

    // Kiểm tra rule revenue — phân loại khách theo tần suất để upsell hoặc reward
    // Ví dụ: total_sessions >= 50 → khách VIP → tặng ưu đãi
    async checkRevenueRules({ location_id }) {
        const rules = await CustomerCareRule.find({
            location_id,
            category: "revenue",
            is_active: true,
        }).lean();

        if (rules.length === 0) {
            logger.info(`[ruleCustomer] No active revenue rules for location=${location_id}`);
            return;
        }

        // Lấy tất cả customer kể cả INACTIVE để đánh giá đầy đủ
        const customers = await Customer.find({ locationId: location_id }).lean();

        if (customers.length === 0) return;

        logger.info(
            `[ruleCustomer] Checking revenue | rules=${rules.length} | customers=${customers.length}`
        );

        for (const customer of customers) {
            for (const rule of rules) {
                // Hỗ trợ cả snake_case (metric_name) và camelCase (metricName)
                const metricName = rule.logic?.metric_name || rule.logic?.metricName;
                const { operator, threshold } = rule.logic;

                const actualValue = this._getMetricValue(customer, metricName);

                if (actualValue === null) continue;

                if (this._evaluate(actualValue, operator, threshold)) {
                    await this._createNotification(rule, location_id, customer);
                }
            }
        }
    },

    // Kiểm tra rule zone — được trigger từ dwell_time_realtime_channel
    // Khi một track_id dừng tại zone vượt ngưỡng dwell_time trong rule → tạo ALERT
    //
    // payload.data = { event_type: "ping", track_id: "12", dwell_time: 45.3, zone_id: "ZONE_CAM1_001" }
    // payload.info = { camera_id: "CAM_001", location_id: "LOC_001" }
    async checkZoneRules({ payload, io }) {
        const { data, infor } = payload;
        logger.info(`[ruleCustomer] checkZoneRules received | event_type=${data?.event_type} | dwell=${data?.dwell_time} | zone=${data?.zone_id} | location=${infor?.location_id}`);
        // Chỉ xử lý event ping — stop event không cần alert realtime
        if (!data || data.event_type !== "ping") return;

        const { track_id, dwell_time, zone_id } = data;
        const { location_id } = infor || {};

        if (!location_id || !track_id || dwell_time == null) {
            logger.warn(`[ruleCustomer] checkZoneRules: missing required fields`);
            return;
        }

        // Lấy tất cả rule zone active của location
        const rules = await CustomerCareRule.find({
            location_id,
            category: "zone",
            is_active: true,
        }).lean();

        if (rules.length === 0) {
            logger.info(`[ruleCustomer] No active zone rules for location=${location_id}`);
            return;
        }

        logger.info(`[ruleCustomer] Found ${rules.length} zone rules to check`);

        for (const rule of rules) {
            // Hỗ trợ cả snake_case (metric_name) và camelCase (metricName)
            const metricName = rule.logic?.metric_name || rule.logic?.metricName;
            const { operator, threshold } = rule.logic;

            logger.info(`[ruleCustomer] Rule=${rule.rule_id} | metric=${metricName} | ${operator} ${threshold} | rule.zone_id=${rule.zone_id} | actual zone=${zone_id} | dwell=${dwell_time}`);

            // Rule zone chỉ áp dụng cho metric dwell_time
            if (metricName !== "dwell_time") {
                logger.warn(`[ruleCustomer] Skip — metric mismatch: ${metricName}`);
                continue;
            }

            // Nếu rule có zone_id cụ thể thì chỉ check đúng zone đó
            // Nếu rule không có zone_id thì áp dụng cho tất cả zone
            if (rule.zone_id && zone_id && rule.zone_id !== zone_id) {
                logger.info(`[ruleCustomer] Skip — zone mismatch: rule=${rule.zone_id} actual=${zone_id}`);
                continue;
            }

            // Kiểm tra ngưỡng dwell_time (đơn vị: giây)
            if (!this._evaluate(dwell_time, operator, threshold)) {
                logger.info(`[ruleCustomer] Skip — threshold not met: ${dwell_time} ${operator} ${threshold}`);
                continue;
            }

            // Kiểm tra cooldown — tránh spam notification
            const cooldownKey = `${location_id}:${track_id}:${rule.rule_id}`;
            const lastAlertTime = _zoneCooldownMap.get(cooldownKey) || 0;
            const now = Date.now();

            if (now - lastAlertTime < ZONE_ALERT_COOLDOWN_MS) {
                logger.info(
                    `[ruleCustomer] Zone alert skipped (cooldown) | track=${track_id} | rule=${rule.rule_id}`
                );
                continue;
            }

            // Cập nhật cooldown trước khi tạo notification
            _zoneCooldownMap.set(cooldownKey, now);

            // Tạo notification ALERT
            try {
                const notification = await Notification.create({
                    location_id,
                    rule_id: rule.rule_id,
                    type:    "ZONE",
                    title:   "ALERT",
                    message: `${rule.action} | Khu vực: ${zone_id || "không xác định"} | Thời gian dừng: ${dwell_time.toFixed(1)}s`,
                    is_read: false,
                });

                logger.info(
                    `[ruleCustomer] Zone alert created | rule=${rule.rule_id} | track=${track_id} | zone=${zone_id} | dwell=${dwell_time}s`
                );

                // Push realtime lên FE qua Socket.IO
                if (io) {
                    io.to(location_id).emit("new_alert", {
                        ...notification.toObject(),
                        location_id,
                    });
                }
            } catch (err) {
                logger.error(`[ruleCustomer] Failed to create zone alert: ${err.message}`);
            }
        }
    },

    // Entry point — gọi từ controller khi API được trigger
    // Chạy song song retention + revenue để tối ưu thời gian
    async process({ location_id }) {
        if (!location_id) {
            logger.warn("[ruleCustomer] Missing location_id");
            return;
        }

        logger.info(`[ruleCustomer] Starting rule evaluation | location=${location_id}`);

        try {
            await Promise.all([
                this.checkRetentionRules({ location_id }),
                this.checkRevenueRules({ location_id }),
            ]);

            logger.info(`[ruleCustomer] Rule evaluation completed | location=${location_id}`);
        } catch (err) {
            logger.error(`[ruleCustomer] Process failed: ${err.message}`);
            throw err;
        }
    },
};

module.exports = ruleCustomerWorker;
