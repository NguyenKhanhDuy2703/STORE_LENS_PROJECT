const express = require('express');
const router = express.Router();
const {getHeatmapController} = require("../controllers/heatmap.controller")
router.get("/:locationId/:cameraId" , getHeatmapController);
module.exports = router;