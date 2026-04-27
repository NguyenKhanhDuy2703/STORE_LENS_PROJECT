const express = require('express');
const router = express.Router();
const { 
    getNotificationsController, 
    markReadController,
    syncNotificationsController,
} = require('../controllers/notification.controller');

router.get('/list', getNotificationsController);
router.post('/sync', syncNotificationsController);  // trigger rule worker thủ công
router.patch('/read/:id', markReadController);

module.exports = router;