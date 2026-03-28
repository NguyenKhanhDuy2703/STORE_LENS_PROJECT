const express = require('express');
const router = express.Router();
const { dashboardStatsController, getAvailableLocationsController } = require('../controllers/dashboard.controller');

router.get('/kpi-cards/:location_id?', dashboardStatsController);

module.exports = router;