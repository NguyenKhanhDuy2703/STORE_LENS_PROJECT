const {asyncLocationStasController , asyncZoneStatsController} = require("../controllers/asyncData.controller");
const express = require("express");
const router = express.Router();

router.get("/stats/:locationId" , asyncLocationStasController)
router.get("/stats/:locationId/:zoneId" , asyncZoneStatsController)
module.exports = router;