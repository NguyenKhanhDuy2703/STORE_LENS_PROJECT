const express = require('express');
const router = express.Router();
const { getAssetController, addAndUpdateAssetController, deleteAssetController } = require('../controllers/asset.controller');

router.get("/", getAssetController);
router.post("/", addAndUpdateAssetController);
router.delete("/", deleteAssetController);

module.exports = router;
