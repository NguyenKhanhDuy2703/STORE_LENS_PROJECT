const express = require('express');
const router = express.Router();
const {getHeatmapCntroller} = require("../controllers/heatmap.controller")
router.get("/:locationId/:cameraId" , getHeatmapCntroller);
module.exports = router;