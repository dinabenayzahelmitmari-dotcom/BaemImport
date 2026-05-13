
const express = require('express');
const router = express.Router();
const { sendClientEmail, downloadPDF, askAI } = require('../controllers/communicationController');
const { authMiddleware } = require('../middleware/auth');

// Endpoint: POST /email
router.post('/email', authMiddleware, sendClientEmail);
// Endpoint: POST /pdf
router.post('/pdf', authMiddleware, downloadPDF);
// Endpoint: POST /ai/ask
router.post('/ai/ask', authMiddleware, askAI);

module.exports = router;
