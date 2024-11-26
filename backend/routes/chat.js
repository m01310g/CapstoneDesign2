const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const { route } = require('./post');

router.get('/api/chat/get-message', chatService.getMessages);
router.post('/api/chat/send-message', chatService.sendMessage);
router.get('/api/chat/check-participation/:postId', chatService.checkParticipation);
router.post('/api/chat/update-participation-status/:postId/:userId', chatService.updateParticipateStatus);
router.post('/api/chat/create-room', chatService.createChatRoom);
router.get('/api/chat/get-chat-rooms', chatService.getChatRooms);
router.get('/api/chat/get-user-count', chatService.getUserCounts);
router.post('/api/chat/leave-chat-room', chatService.leaveChatRoom);
router.post('/api/chat/reserve-trade', chatService.reserveTrade);
router.post('/api/chat/start-trade', chatService.startTrade);
router.get('/api/chat/check-reservation', chatService.checkReservationStatus);
router.post('/api/chat/cancel-reservation', chatService.cancelReservation);
router.get('/api/chat/get-reservation-count', chatService.getReservationCount);
router.get('/api/chat/check-trade-status', chatService.checkTradeStatus);
router.get('/api/chat/get-payment-status', chatService.getPaymentStatus);
router.get('/api/chat/user-confirmed', chatService.userConfirmed);
router.post('/api/chat/update-reservation-amounts', chatService.updateReservationAmounts);
router.get('/api/chat/check-any-confirmed', chatService.checkAnyConfirmed);
router.post('/api/chat/toggle-confirmed-status', chatService.toggleConfirmedStatus);
router.get('/api/chat/check-all-confirmed', chatService.checkAllConfirmed);
router.get('/api/chat/get-participations', chatService.getParticipations);
router.get('/api/chat/get-reservations', chatService.getReservations);
router.post('/api/chat/kick-participant', chatService.kickParticiapnt);
router.post('/api/chat/report-user', chatService.reportUser)

module.exports = router;