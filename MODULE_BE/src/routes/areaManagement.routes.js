const express = require('express');
const router = express.Router();
const { 
    getAreaManagementMetricsController, 
    getAreaManagementHourlyTrafficController, 
    getAreaManagementZonePerformanceController 
} = require('../controllers/areaManagement.controller');

router.get('/kpis', getAreaManagementMetricsController);
router.get('/hourly-traffic', getAreaManagementHourlyTrafficController);
router.get('/performance-details', getAreaManagementZonePerformanceController);

module.exports = router;