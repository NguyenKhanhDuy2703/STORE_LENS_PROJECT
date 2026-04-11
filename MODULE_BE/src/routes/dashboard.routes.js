const express = require('express');
const router = express.Router();
const { getKPIMetricsController, getHourlyCustomerFlowController, getRevenueLast7DaysController, getHighTrafficZonesController, getZonePerformanceDetailsController } = require('../controllers/dashboard.controller');

router.get('/kpis/:locationId', getKPIMetricsController);
router.get('/hourly-flow/:locationId', getHourlyCustomerFlowController);
router.get('/revenue-7days/:locationId', getRevenueLast7DaysController);
router.get('/high-traffic-zones/:locationId', getHighTrafficZonesController);
router.get('/performance-details/:locationId', getZonePerformanceDetailsController);

module.exports = router;