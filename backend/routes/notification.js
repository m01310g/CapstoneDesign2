const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

router.get('/api/notifications', notificationService.getNotification);
router.post('/api/notifications', notificationService.addNotification);
router.post('/api/notifications/mark-as-read', notificationService.markNotificationsAsRead);

module.exports = router;