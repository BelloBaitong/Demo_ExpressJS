import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import mongoose from "mongoose";
import Marketer from "../../models/Marketer"; // Import your Marketer model
import Transaction from "../../models/Transaction"; // Import your Transaction model
import Influencer from "../../models/Influencer"; // Import your Influencer model
import Job from "../../models/Job"; // Import your Job model

const mockBaseQuery = async (arg) => {
    await mongoose.connect(process.env.MONGO_URI); // Ensure you are connected to your MongoDB

    const token = Cookies.get('accessToken');
    if (!token) {
        return { error: { status: 401, data: "unauthorize" } };
    }

    const marketer = await Marketer.findOne({ accessToken: token });
    if (!marketer) {
        return { error: { status: 401, data: "unauthorize" } };
    }

    const accountId = marketer.accountId;

    if (arg.url === '/finance-transaction') {
        const transactions = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 });
        return { data: transactions };
    } else if (arg.url === '/get-balance') {
        const lastTransaction = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 }).limit(1);
        const balance = lastTransaction[0]?.balance || 0;
        return { data: balance };
    } else if (arg.url === '/deposit') {
        const { amount, sourceAccountNumber, bank } = arg.body;
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
        return { data: "success" };
    } else if (arg.url === '/consume-credit') {
        const { amount, referenceJobId } = arg.body;
        const lastTransaction = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 }).limit(1);
        const balance = lastTransaction[0]?.balance || 0;

        if (amount > balance) {
            return { error: { status: 400, data: "เงินคงเหลือไม่เพียงพอ" } };
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
        return { data: "success" };
    } else if (arg.url === '/withdraw') {
        const { amount, sourceAccountNumber, bank } = arg.body;
        const lastTransaction = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 }).limit(1);
        const balance = lastTransaction[0]?.balance || 0;

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
        return { data: "success" };
    } else if (arg.url === '/approve-pay-credit') {
        const { influId, jobId, referenceJobEnrollId } = arg.body;

        const influencer = await Influencer.findOne({ influId });
        if (!influencer) {
            return { error: { status: 404, data: "Influencer not found" } };
        }

        const accountId = influencer.accountId;

        const lastTransaction = await Transaction.find({ sourceAccountId: accountId }).sort({ createDate: -1 }).limit(1);
        const balance = lastTransaction[0]?.balance || 0;

        const job = await Job.findOne({ jobId });
        if (!job) {
            return { error: { status: 404, data: "Job not found" } };
        }

        const amount = job.paymentPerInfluencer;

        const newTransaction = new Transaction({
            amount,
            balance: balance + amount,
            transactionType: 'receive',
            sourceAccountId: accountId,
            destinationAccountId: null,
            status: "success",
            remark: `ได้รับเงิน  จากการทำงานหมายเลข ${jobId} ${job?.jobTitle}`,
            referenceJobId: jobId,
            referenceJobEnrollId: referenceJobEnrollId,
        });

        await newTransaction.save();
        return { data: "success" };
    }

    return { error: { status: 404, data: 'Not found' } };
};

export const mktFinanceApi = createApi({
    reducerPath: "mktFinanceApi",
    baseQuery: mockBaseQuery,
    endpoints: (builder) => {
        return {
            finanaceTransactions: builder.query({
                query: () => ({
                    url: "/finance-transaction",
                    method: "GET",
                })
            }),
            getBalance: builder.query({
                query: () => ({
                    url: "/get-balance",
                    method: "GET",
                })
            }),
            deposit: builder.mutation({
                query: ({ amount, sourceAccountNumber, bank }) => ({
                    url: "/deposit",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: { amount, sourceAccountNumber, bank }
                })
            }),
            withdraw: builder.mutation({
                query: ({ amount, sourceAccountNumber, bank }) => ({
                    url: "/withdraw",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: { amount, sourceAccountNumber, bank }
                })
            }),
            consumeCredit: builder.mutation({
                query: ({ amount, referenceJobId }) => ({
                    url: "/consume-credit",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: { amount, referenceJobId }
                })
            }),
            approvePaycredit: builder.mutation({
                query: ({ influId, jobId, referenceJobEnrollId }) => ({
                    url: "/approve-pay-credit",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: { influId, jobId, referenceJobEnrollId }
                })
            })
        };
    }
});

export const {
    useFinanaceTransactionsQuery,
    useGetBalanceQuery,
    useDepositMutation,
    useWithdrawMutation,
    useConsumeCreditMutation,
    useApprovePaycreditMutation
} = mktFinanceApi;
