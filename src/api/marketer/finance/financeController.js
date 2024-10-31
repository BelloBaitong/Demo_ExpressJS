const { Marketer } = require('../auth/authModel');
const { Transaction } = require('../../influencer/finance/financeModel'); // เชื่อมต่อกับ financeModel
const {sendLineNotification} = require('../../../utils/sendNoti');
//const sendEmailNotification = require('../../../../index');
const {Influencer} = require ('../../influencer/auth/authModel');
const { Job } = require('../../influencer/job/jobModel')


// ตรวจสอบ token และดึงข้อมูลผู้ใช้
async function validateUser(userId) {

    const marketer = await Marketer.findOne({ _id : userId });
    if (!marketer) throw { status: 401, message: "unauthorize" };

    return marketer.accountId;
}


// ดึงธุรกรรมทางการเงินทั้งหมด
const getTransactions = async (req, res) => {
    try {
        const marketer = await Marketer.findById(req.user.id);
        if (!marketer) {
            return res.status(404).json({ message: "Marketer not found" });
        }
        const accountId = marketer.accountId;
        const transactions = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};



const getBalance = async (req, res) => {
    try {
        const marketer = await Marketer.findById(req.user.id);
        if (!marketer) {
            return res.status(404).json({ message: "Marketer not found" });
        }
        const accountId = marketer.accountId;
        const lastTransaction = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 }).limit(1);
        const balance = lastTransaction[0]?.balance || 0;
        return res.status(200).json({ balance });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching balance', error });
    }
};

const deposit = async (req, res) => {
    try {
        const { amount, sourceAccountNumber, bank } = req.body;
        const marketer = await Marketer.findById(req.user.id);
        if (!marketer) {
            return res.status(404).json({ message: "Marketer not found" });
        }
        const accountId = marketer.accountId;

        const lastTransaction = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 }).limit(1);
        const balance = lastTransaction[0]?.balance || 0;

        const newTransaction = new Transaction({
            amount,
            balance: balance + amount,
            transactionType: 'deposit',
            sourceAccountId: accountId,
            destinationAccountId: null,
            status: "success",
            remark: `ฝากเงิน จาก ${bank} เลขบัญชี ${sourceAccountNumber}`,
        });
        await newTransaction.save();
        await sendLineNotification(`มีการฝากเงินจำนวน ${amount} จาก ${bank} เลขบัญชี ${sourceAccountNumber} สำเร็จ`);

        //const subject = 'แจ้งเตือนการฝากเงินสำเร็จ';
        //const message = `มีการฝากเงินจำนวน ${amount} จาก ${bank} เลขบัญชี ${sourceAccountNumber} สำเร็จ`;

        //await sendEmailNotification('baitongbuibui100010@gmail.com', subject, message);

        return res.status(200).json({ message: "Deposit successful" });
    } catch (error) {
        return res.status(500).json({ message: 'Error processing deposit', error });
    }
};

const withdraw = async (req, res) => {
    try {
        const { amount, sourceAccountNumber, bank } = req.body;
        const marketer = await Marketer.findById(req.user.id);
        if (!marketer) {
            return res.status(404).json({ message: "Marketer not found" });
        }
        const accountId = marketer.accountId;

        const lastTransaction = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 }).limit(1);
        const balance = lastTransaction[0]?.balance || 0;

        if (amount > balance) {
            return res.status(400).json({ message: 'เงินคงเหลือไม่เพียงพอ' });
        }

        const newTransaction = new Transaction({
            amount,
            balance: balance - amount,
            transactionType: 'withdraw',
            sourceAccountId: accountId,
            destinationAccountId: null,
            status: "success",
            remark: `ถอนเงิน ไปยัง ${bank} เลขบัญชี ${sourceAccountNumber}`,
        });

        await newTransaction.save();
        //await sendLineNotification(`มีการถอนเงินจำนวน ${amount} จาก ${bank} เลขบัญชี ${sourceAccountNumber} สำเร็จ`);


        return res.status(200).json({ message: "Withdraw successful" });
    } catch (error) {
        return res.status(500).json({ message: 'Error processing withdrawal', error });
    }
};

const consumeCredit = async (req, res) => {
    try {
        const { amount, referenceJobId } = req.body;
        const marketer = await Marketer.findById(req.user.id);
        if (!marketer) {
            return res.status(404).json({ message: "Marketer not found" });
        }
        const accountId = marketer.accountId;


        const lastTransaction = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 }).limit(1);
        const balance = lastTransaction[0]?.balance || 0;
        console.log(balance)
        if (amount > balance) {
            return res.status(400).json({ message: 'เงินคงเหลือไม่เพียงพอ' });
        }

        const newTransaction = new Transaction({
            amount,
            balance: balance - amount,
            transactionType: 'consume',
            sourceAccountId: accountId,
            destinationAccountId: null,
            status: "success",
            remark: `หักเงินออก จากเครดิต`,
            referenceJobId: referenceJobId,
        });

        await newTransaction.save();
        return res.status(200).json({ message: "Credit consumed successfully" });
    } catch (error) {
        return res.status(500).json({ message: 'Error processing credit consumption', error });
    }
};

const approvePayCredit = async (req, res) => {
    try {
        const { influId, jobId, referenceJobEnrollId } = req.body;

        // ดึงข้อมูล Influencer จาก influId
        const influencer = await Influencer.findById(influId);
        if (!influencer) {
            return res.status(404).json({ message: "Influencer not found" });
        }
        const accountId = influencer.accountId;

        const lastTransaction = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 }).limit(1);
        const balance = lastTransaction[0]?.balance || 0;

        const job = await Job.findOne({ jobId });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const amount = job.paymentPerInfluencer;

        const newTransaction = new Transaction({
            amount,
            balance: balance + amount,
            transactionType: 'receive',
            sourceAccountId: accountId,
            destinationAccountId: null,
            status: "success",
            remark: `ได้รับเงิน จากการทำงานหมายเลข ${jobId} ${job?.jobTitle}`,
            referenceJobId: jobId,
            referenceJobEnrollId: referenceJobEnrollId,
        });

        await newTransaction.save();
        return res.status(200).json({ message: "Payment approved successfully" });
    } catch (error) {
        return res.status(500).json({ message: 'Error processing payment approval', error });
    }
};

module.exports = {
    validateUser,
    getTransactions,
    getBalance,
    deposit,
    withdraw,
    consumeCredit,
    approvePayCredit,
};
