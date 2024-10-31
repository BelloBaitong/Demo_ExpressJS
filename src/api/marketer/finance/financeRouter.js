const express = require('express');
const financeController = require('./financeController');
const authMiddleware = require('../../../middleware/authMiddleware.js'); // Import the middleware
const router = express.Router();

router.get('/finance-transaction', authMiddleware, financeController.getTransactions); //ทำไมvalidate แล้วไม่ขึ้น
router.get('/get-balance', authMiddleware, financeController.getBalance); 
router.post('/deposit', authMiddleware, financeController.deposit);
router.post('/withdraw', authMiddleware, financeController.withdraw);
router.post('/consume-credit', authMiddleware, financeController.consumeCredit);
router.post('/approve-pay-credit', authMiddleware, financeController.approvePayCredit);

module.exports = router;
