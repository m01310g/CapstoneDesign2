const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

router.get('/api/notifications', notificationService.getNotification);
router.post('/api/notifications', notificationService.addNotification);
router.post('/api/notifications/mark-as-read', notificationService.markNotificationsAsRead);
router.get('/api/notifications/count-notifications', notificationService.countNotifications);
router.delete('/api/notifications/:id', notificationService.deleteNotification);
router.get('/api/notifications/count', notificationService.getNotificationCount);

module.exports = router;