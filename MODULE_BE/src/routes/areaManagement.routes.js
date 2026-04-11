const express = require('express');
const router = express.Router();
const { 
    getAreaManagementMetricsController, 
    getAreaManagementHourlyTrafficController, 
    getAreaManagementZonePerformanceController 
} = require('../controllers/areaManagement.controller');

router.get('/kpis/:locationId/:zoneId', getAreaManagementMetricsController);
router.get('/hourly-traffic/:locationId/:zoneId', getAreaManagementHourlyTrafficController);
router.get('/performance-details/:locationId', getAreaManagementZonePerformanceController);

module.exports = router;