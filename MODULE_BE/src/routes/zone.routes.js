const express = require('express');
const router = express.Router();
const { getListZoneController, createAndUpdateZoneController, deleteZoneController } = require('../controllers/zone.controller');
const  {mwHandleUploadSingle} = require("../middlewares/handleImage.middleware") 
router.get("/", getListZoneController);
router.post("/", mwHandleUploadSingle, createAndUpdateZoneController);
router.delete("/", deleteZoneController);
module.exports = router;