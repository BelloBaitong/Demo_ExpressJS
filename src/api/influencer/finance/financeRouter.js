const express = require('express');
const financeController = require('./financeController');
const authMiddleware = require('../../../middleware/authMiddleware.js'); // Import the middleware
const router = express.Router();

router.get('/finance-transaction', authMiddleware, financeController.getTransactions); //ข้อมูลไม่โชว์
router.get('/get-balance', authMiddleware, financeController.getBalance);
router.post('/withdraw', authMiddleware, financeController.withdraw);
router.post('/deposit', authMiddleware, financeController.deposit);

module.exports = router;
