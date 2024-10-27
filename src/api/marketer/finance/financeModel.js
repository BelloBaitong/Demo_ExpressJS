const mongoose = require('mongoose')


const TransactionSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    amount: { type: Number },
    balance: { type: Number },
    transactionType: { type: String },
    sourceAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    destinationAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    createDate: { type: Date, default: Date.now },
    status: { type: String },
    remark: { type: String },
    referenceJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    referenceJobEnrollId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobEnroll' }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = {
    Transaction
}