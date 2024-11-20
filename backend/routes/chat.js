const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');

router.get('/api/chat/get-message', chatService.getMessages);
router.post('/api/chat/send-message', chatService.sendMessage);
router.get('/api/chat/check-participation/:postId', chatService.checkParticipation);
router.post('/api/chat/update-participation-status/:postId/:userId', chatService.updateParticipateStatus);
router.post('/api/chat/create-room', chatService.createChatRoom);
router.get('/api/chat/get-chat-rooms', chatService.getChatRooms);
router.get('/api/chat/get-user-count', chatService.getUserCounts);
router.post('/api/chat/leave-chat-room', chatService.leaveChatRoom);

module.exports = router;