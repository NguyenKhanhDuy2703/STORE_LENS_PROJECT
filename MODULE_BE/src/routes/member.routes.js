const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
// const { authenticationToken } = require('../middlewares/auth.middleware');

// READ operations
router.get('/dashboard', 
    // authenticationToken,
    memberController.getDashboard);

router.get('/member-detail', 
    // authenticationToken,
    memberController.getMemberDetail);

// CREATE operation
router.post('/create',
    // authenticationToken,
    memberController.createMember);

// UPDATE operations
router.patch('/update-note',
    // authenticationToken,
    memberController.updateMemberNote);

router.put('/update',
    // authenticationToken,
    memberController.updateMember);

// DELETE operation
router.delete('/delete',
    // authenticationToken,
    memberController.deleteMember);

module.exports = router;