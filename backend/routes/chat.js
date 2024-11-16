const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');

router.get('/api/chat/:chatId', chatService.getChatMessage);
router.post('/api/chat/:chatId', chatService.sendMessage);
router.get('/api/chat/check-participation/:postId', chatService.checkParticipation);
router.post('/api/chat/update-participation-status/:postId/:userId', chatService.updateParticipateStatus);
router.post('/api/chat/create-room', chatService.createChatRoom);

module.exports = router;