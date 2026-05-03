const express = require('express');
const router = express.Router();
const { sendClientEmail, downloadPDF, askAI } = require('../controllers/communicationController');
const { authMiddleware } = require('../middleware/auth');

router.post('/email', authMiddleware, sendClientEmail);
router.post('/pdf', authMiddleware, downloadPDF);
router.post('/ai/ask', authMiddleware, askAI);

module.exports = router;
