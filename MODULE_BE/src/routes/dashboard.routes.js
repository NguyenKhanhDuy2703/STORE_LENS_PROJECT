const express = require('express');
const router = express.Router();
const { getKPIMetricsController, getHourlyCustomerFlowController, getRevenueLast7DaysController, getZoneAnalyticsDashboardController } = require('../controllers/dashboard.controller');

router.get('/kpis/:locationId', getKPIMetricsController);
router.get('/hourly-flow/:locationId', getHourlyCustomerFlowController);
router.get('/revenue-7days/:locationId', getRevenueLast7DaysController);
router.get('/zone-analytics/:locationId', getZoneAnalyticsDashboardController);

module.exports = router;