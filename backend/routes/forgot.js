const express = require('express');
const router = express.Router();
const forgotService = require("../services/forgotService");

router.get("/forgot-id", forgotService.showForgotIdPage);
router.post("/forgot-id", forgotService.forgotId);
router.get("/forgot-pw", forgotService.showForgotPwPage);
router.post("/forgot-pw", forgotService.forgotPw);

module.exports = router;