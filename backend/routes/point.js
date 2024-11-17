const express = require('express');
const router = express.Router();
const pointService = require("../services/pointService");

router.post('/pay', pointService.pay);
router.get('/pay/success', pointService.success);
router.post('/exchange', pointService.exchange);

module.exports = router;