const { Influencer } = require('../auth/authModel');
const { Transaction } = require('./financeModel');
const Cookies = require('js-cookie');


// ตรวจสอบ token และดึงข้อมูลผู้ใช้
async function validateUser(userId) {

    const influencer = await Influencer.findOne({ _id : userId });
    if (!influencer) throw { status: 401, message: "unauthorize" };

    return influencer.accountId;
}

// ดึงธุรกรรมทางการเงินทั้งหมด
exports.getTransactions = async (req, res) => {
    try {
        const accountId = await validateUser(req.user.id);
        const transactions = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

// ดึงยอดคงเหลือ
exports.getBalance = async (req, res) => {
    try {
        const accountId = await validateUser(req.user.id);
        const lastTransaction = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 }).limit(1);
        const balance = lastTransaction[0]?.balance || 0;
        res.status(200).json({ balance });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

// ถอนเงิน
exports.withdraw = async (req, res) => {
    try {
        const { amount, sourceAccountNumber, bank } = req.body;
        const accountId = await validateUser(req.user.id);
        
        // ตรวจสอบยอดคงเหลือก่อนถอน
        const lastTransaction = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 }).limit(1);
        const balance = lastTransaction[0]?.balance || 0;

        if (balance < amount) {
            return res.status(400).json({ message: "ยอดเงินไม่เพียงพอ" });
        }

        // บันทึกการถอนเงิน
        const newTransaction = new Transaction({
            amount,
            balance: balance - amount,
            transactionType: 'withdraw',
            sourceAccountId: accountId,
            destinationAccountId: null,
            status: "success",
            remark: `ถอนเงิน ไปยัง ${bank} เลขบัญชี ${sourceAccountNumber}`
        });

        await newTransaction.save();
        res.status(200).json({ message: "success" });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.deposit = async (req, res) => {
    try {
        const { amount, sourceAccountNumber, bank } = req.body;
        const accountId = await validateUser(req.user.id);
        
        // ตรวจสอบยอดคงเหลือก่อนถอน
        const lastTransaction = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 }).limit(1);
        const balance = lastTransaction[0]?.balance || 0;

        // บันทึกการถอนเงิน
        const newTransaction = new Transaction({
            amount,
            balance: balance + amount,
            transactionType: 'deposit',
            sourceAccountId: accountId,
            destinationAccountId: null,
            status: "success",
            remark: `ถอนเงิน ไปยัง ${bank} เลขบัญชี ${sourceAccountNumber}`
        });

        await newTransaction.save();
        res.status(200).json({ message: "success" });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};
