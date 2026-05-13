const express = require('express');
const router = express.Router();
const { getListZoneController, createAndUpdateZoneController, deleteZoneController, uploadZoneImageController } = require('../controllers/zone.controller');
const  {mwHandleUploadSingle} = require("../middlewares/handleImage.middleware") 
router.get("/", getListZoneController);
router.post("/upload-image", mwHandleUploadSingle, uploadZoneImageController);
router.post("/", mwHandleUploadSingle, createAndUpdateZoneController);
router.delete("/", deleteZoneController);
module.exports = router;