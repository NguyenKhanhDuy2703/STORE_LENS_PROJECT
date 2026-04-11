const { tunrOffcameraController, 
    turnOncameraController, 
    upsertCameraController,
    deleteCameraController,
    getCameraController } = require("../controllers/camera.controller");
const express = require("express");
const router = express.Router();
router.post("/turn-on", turnOncameraController);
router.get("/turn-off", tunrOffcameraController);
router.get('/', getCameraController);
router.post('/', upsertCameraController);
router.delete('/:cameraCode', deleteCameraController);
module.exports = router;