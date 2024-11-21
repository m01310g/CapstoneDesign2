const express = require('express');
const router = express.Router();
const postService = require('../services/postService');

router.post('/api/post', postService.writePost);
router.get('/api/post', postService.returnPost);
router.get('/api/post/view/:id', postService.returnPostById);
router.put('/api/post/modify/:id', postService.modifyPost);
router.delete('/api/post/delete/:id', postService.deletePost);
router.post('/api/post/update-capacity/:id', postService.updateCurrentCapacity);
router.get('/api/post/has-reservations/:postId', postService.getReservationStatus);

module.exports = router;