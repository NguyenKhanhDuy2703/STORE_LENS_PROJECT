const express = require("express");
const router = express.Router();
const { getLocationLocationController } = require("../controllers/location.controller");
router.get("/:locationId", getLocationLocationController);

module.exports = router;