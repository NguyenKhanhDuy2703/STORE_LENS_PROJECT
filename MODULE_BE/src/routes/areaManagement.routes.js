const express = require('express');
const router = express.Router();
const { getAreaManagementMetricsController, getAreaManagementHourlyTrafficController, getAreaManagementMovementPathsController, getAreaManagementZoneDetailsController } = require('../controllers/areaManagement.controller');

router.get('/kpis', getAreaManagementMetricsController);
router.get('/hourly-traffic', getAreaManagementHourlyTrafficController);
router.get('/movement-paths', getAreaManagementMovementPathsController);
router.get('/zone-details', getAreaManagementZoneDetailsController);

module.exports = router;