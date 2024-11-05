const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

router.get('/api/notifications', notificationService.getNotification);
router.get('/api/notifications', notificationService.addNotification);

module.exports = router;