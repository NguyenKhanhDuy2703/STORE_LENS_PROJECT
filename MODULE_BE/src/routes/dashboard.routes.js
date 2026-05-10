const express = require('express');
const router = express.Router();
const {
    getKPIMetricsController,
    getHourlyCustomerFlowController,
    getRevenueLast7DaysController,
    getZoneAnalyticsDashboardController,
    getMonthlyKPIMetricsController,
    getDailyStatsController,
    getMonthlyZoneAnalyticsController,
    getYearlyStatsController
} = require('../controllers/dashboard.controller');

// Existing routes (type-based)
router.get('/kpis/:locationId',          getKPIMetricsController);
router.get('/hourly-flow/:locationId',   getHourlyCustomerFlowController);
router.get('/revenue-7days/:locationId', getRevenueLast7DaysController);
router.get('/zone-analytics/:locationId', getZoneAnalyticsDashboardController);

// Monthly routes — ?year=2026&month=5
router.get('/monthly/kpis/:locationId',         getMonthlyKPIMetricsController);
router.get('/monthly/daily-stats/:locationId',  getDailyStatsController);
router.get('/monthly/zone-analytics/:locationId', getMonthlyZoneAnalyticsController);
router.get('/monthly/yearly-stats/:locationId', getYearlyStatsController);

module.exports = router;