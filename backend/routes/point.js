const express = require('express');
const router = express.Router();
const pointService = require("../services/pointService");

router.post('/pay', pointService.pay);
router.get('/pay/success', pointService.success);

module.exports = router;