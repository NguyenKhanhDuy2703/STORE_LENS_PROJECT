const express = require("express");
const router = express.Router();
const {
	getMetricsController,
	getPerformanceInteractController,
	getAnalysisDwellTimeController,
} = require("../controllers/dwellTime.controller");

router.get("/metrics/:locationId", getMetricsController);
router.get("/performance-interact/:locationId", getPerformanceInteractController);
router.get("/analysis", getAnalysisDwellTimeController);

module.exports = router;
