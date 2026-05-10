const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upsertBusinessEvent, getBusinessEvents, getBusinessEventDetail, uploadExcelEvents } = require('../controllers/businessEvent.controller');

// Cấu hình multer lưu file vào RAM để worker xử lý buffer
const upload = multer({ storage: multer.memoryStorage() });

router.post('/',  upsertBusinessEvent);
router.post('/upload', upload.single('file'), uploadExcelEvents);
router.get('/',  getBusinessEvents);
router.get('/:eventCode',  getBusinessEventDetail);

module.exports = router;
