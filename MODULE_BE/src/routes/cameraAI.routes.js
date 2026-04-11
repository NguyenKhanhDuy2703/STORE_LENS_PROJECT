const {tunrOffcameraController , turnOncameraController} = require("../controllers/cameraStatus.controller");
const express = require("express");
const router = express.Router();
router.post("/turn-on", turnOncameraController);
router.get("/turn-off", tunrOffcameraController);
module.exports = router;