const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const { authenticationToken } = require('../middlewares/auth.middleware');

// GET /api/v1/member/summary?locationId=...
router.get('/summary', authenticationToken, memberController.getMemberSummary);

// GET /api/v1/member/:memberCode?locationId=...
router.get('/:memberCode', authenticationToken, memberController.getMemberDetail);

// POST /api/v1/member?locationId=...  (upsert: tạo mới hoặc cập nhật theo code)
router.post('/', authenticationToken, memberController.saveMember);

// DELETE /api/v1/member/:memberCode?locationId=...
router.delete('/:memberCode', authenticationToken, memberController.deleteMember);

module.exports = router;
