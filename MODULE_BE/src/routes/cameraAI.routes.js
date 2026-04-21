const {tunrOffcameraController , turnOncameraController} = require("../controllers/cameraStatus.controller");
const { 
    upsertCameraController,
    deleteCameraController,
    getCameraController,
    getCameraAndZoneInfoController,
    getCameraWithZonesByAllcationIdController } = require("../controllers/camera.controller");
const express = require("express");
const router = express.Router();
router.post("/turn-on", turnOncameraController);
router.get("/turn-off", tunrOffcameraController);
router.get('/', getCameraController);
router.get('/camera-zone-info', getCameraAndZoneInfoController);
router.get('/camera-zones-by-allcation', getCameraWithZonesByAllcationIdController);
router.post('/', upsertCameraController);
router.post('/:cameraCode', upsertCameraController);
router.put('/:cameraCode', upsertCameraController);
router.delete('/:cameraCode', deleteCameraController);

module.exports = router;