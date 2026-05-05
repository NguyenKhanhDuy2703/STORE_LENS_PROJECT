const express = require('express');
const router = express.Router();
const { authenticationToken, ALLOWED_ALL } = require('../middlewares/auth.middleware');
const { upsertBusinessEvent, getBusinessEvents, getBusinessEventDetail } = require('../controllers/businessEvent.controller');

router.post('/', authenticationToken, ALLOWED_ALL, upsertBusinessEvent);
router.get('/', authenticationToken, ALLOWED_ALL, getBusinessEvents);
router.get('/:eventCode', authenticationToken, ALLOWED_ALL, getBusinessEventDetail);

module.exports = router;
