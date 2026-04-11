const {tunrOffcameraController , turnOncameraController} = require("../controllers/cameraStatus.controller");
const express = require("express");
const router = express.Router();
const { 
    getCameraKPIMetricsController, 
    getCameraListDetailsController ,
    createCameraController,
    updateCameraController,
    deleteCameraController
} = require('../controllers/camera.controller');
router.post("/turn-on", turnOncameraController);
router.get("/turn-off", tunrOffcameraController);
router.get('/kpis/:locationId', getCameraKPIMetricsController);
router.get('/list/:locationId', getCameraListDetailsController);
router.post('/', createCameraController);
router.put('/:cameraCode', updateCameraController); 
router.delete('/:cameraCode', deleteCameraController); 
module.exports = router;