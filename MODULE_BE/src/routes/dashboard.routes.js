const express = require('express');
const router = express.Router();
const { getKPIMetricsController, getHourlyCustomerFlowController, getRevenueLast7DaysController, getHighTrafficZonesController, getZonePerformanceDetailsController } = require('../controllers/dashboard.controller');

router.get('/kpis', getKPIMetricsController);
router.get('/hourly-flow', getHourlyCustomerFlowController);
router.get('/revenue-7days', getRevenueLast7DaysController);
router.get('/high-traffic-zones', getHighTrafficZonesController);
router.get('/performance-details', getZonePerformanceDetailsController);

module.exports = router;