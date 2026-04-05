const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// API lấy phân tích hội viên
router.get('/insights', authMiddleware, memberController.getInsights);

module.exports = router;