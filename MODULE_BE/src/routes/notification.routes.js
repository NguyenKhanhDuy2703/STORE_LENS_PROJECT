const express = require('express');
const router = express.Router();
const { 
    getNotificationsController, 
    markReadController 
} = require('../controllers/notification.controller');

router.get('/list', getNotificationsController);
// status true là đã đọc còn false là chưa đọc
router.patch('/read/:id', markReadController);

module.exports = router;