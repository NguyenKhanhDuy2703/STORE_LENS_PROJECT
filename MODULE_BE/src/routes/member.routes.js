const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const { authenticationToken } = require('../middlewares/auth.middleware');

// API lấy phân tích hội viên
router.get('/insights', authenticationToken, memberController.getInsights);

module.exports = router;