const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');

router.get('/api/chat/:chatId', chatService.getChatMessage);
router.post('/api/chat/:chatId', chatService.sendMessage);

module.exports = router;