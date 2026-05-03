const express = require('express');
const router = express.Router();
const exportReportController = require('../controllers/exportReport.controller');
router.post('/attendance/:locationId', exportReportController.exportAttendanceReportController);

module.exports = router;