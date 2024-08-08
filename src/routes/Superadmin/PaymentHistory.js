const express = require('express');
const router = express.Router();
const { GetPaymentsList } = require("../../controllers/Superadmin/PaymentHistory");



router.get("/getPayments", GetPaymentsList)
module.exports = router;