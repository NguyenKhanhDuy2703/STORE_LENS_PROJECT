const express = require("express");
const router = express.Router();
const { getConfigRuleController, createAndUpdateConfigRuleController , deleteConfigRuleController } = require("../controllers/customerConfigRule.controller");
router.get("/", getConfigRuleController);
router.post("/", createAndUpdateConfigRuleController);
router.delete("/",deleteConfigRuleController);
module.exports = router;