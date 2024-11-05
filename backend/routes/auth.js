const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

router.post("/login", authService.login);
router.get("/logout", authService.logout);
router.post("/sign-up/user-info", authService.signUp);
router.post("/send-authn", authService.emailAuth);
router.post("/sign-up/user-location", authService.saveLocation);
router.post("/sign-up/user-id-availability", authService.checkId);
router.post("/sign-up/user-nickname-availability", authService.checkNickname);
router.post("/my-info-change", authService.myInfoChange);
router.post("/change-pw", authService.changePw);
router.get('/api/session/user-id', authService.getSessionUserId);
router.get('/api/session/user-info', authService.getSessionUserInfo);

module.exports = router;