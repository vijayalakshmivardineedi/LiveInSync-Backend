const express = require('express');
const { generateQRCode } = require('../controllers/QrCode');

const router = express.Router();

router.post('/generateQRCode/:id', generateQRCode);

module.exports = router;