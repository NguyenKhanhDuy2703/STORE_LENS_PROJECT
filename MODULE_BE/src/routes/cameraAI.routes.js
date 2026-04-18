const {tunrOffcameraController , turnOncameraController} = require("../controllers/cameraStatus.controller");
const { 
    upsertCameraController,
    deleteCameraController,
    getCameraController } = require("../controllers/camera.controller");
const express = require("express");
const router = express.Router();
router.post("/turn-on", turnOncameraController);
router.get("/turn-off", tunrOffcameraController);
router.get('/', getCameraController);
router.post('/', upsertCameraController);
router.post('/:cameraCode', upsertCameraController);
router.put('/:cameraCode', upsertCameraController);
router.delete('/:cameraCode', deleteCameraController);

module.exports = router;