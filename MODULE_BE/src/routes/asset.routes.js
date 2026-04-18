const express = require('express');
const router = express.Router();
const { getAssetController, addAndUpdateAssetController, deleteAssetController, getMestricAssetByLocationID } = require('../controllers/asset.controller');

router.get("/", getAssetController);
router.get("/metric", getMestricAssetByLocationID);
router.post("/", addAndUpdateAssetController);
router.delete("/", deleteAssetController);

module.exports = router;
