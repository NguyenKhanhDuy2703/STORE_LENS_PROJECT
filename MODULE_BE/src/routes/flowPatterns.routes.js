const express = require("express");
const router = express.Router();
const {
    analyzeFlowPatternsController,
    getFlowPatternsController
} = require("../controllers/flowPatterns.controller");

// POST /api/v1/flow-patterns/analyze/:locationId — kích hoạt phân tích FP-Growth
router.post("/analyze/:locationId", analyzeFlowPatternsController);

// GET /api/v1/flow-patterns/:locationId — lấy kết quả đã lưu
router.get("/:locationId", getFlowPatternsController);

module.exports = router;
