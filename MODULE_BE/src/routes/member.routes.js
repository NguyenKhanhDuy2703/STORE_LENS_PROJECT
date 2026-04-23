const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
// const { authenticationToken } = require('../middlewares/auth.middleware');

// Member dashboard endpoints
router.get('/dashboard', 
    // authenticationToken,
    memberController.getDashboard);
router.get('/member-detail', 
    // authenticationToken,
    memberController.getMemberDetail);

module.exports = router;