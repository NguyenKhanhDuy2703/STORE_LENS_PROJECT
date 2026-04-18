const express = require('express');
const router = express.Router();
const { getAllStores , getStoreById } = require('../controllers/storesController');
const { authenticationToken, ALLOWED_ALL } = require('../middlewares/auth.middleware');
router.get('/', authenticationToken, ALLOWED_ALL, getAllStores);
router.get('/:id', authenticationToken, ALLOWED_ALL, getStoreById);

module.exports = router;