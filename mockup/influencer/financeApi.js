import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import Influencer from "../../models/Influencer"; // โมเดล Influencer
import Transaction from "../../models/Transaction"; // โมเดล Transaction

const mockBaseQuery = async (arg) => {
    const token = Cookies.get('accessToken');
    if (!token) {
        return { error: { status: 401, data: "unauthorize" } };
    }

    // หาข้อมูล Influencer ตาม accessToken
    const findToken = await Influencer.findOne({ accessToken: token });
    if (!findToken) {
        return { error: { status: 401, data: "unauthorize" } };
    }

    const accountId = findToken.accountId;

    if (arg.url === '/finance-transaction') {
        // ดึงรายการ transaction ตาม sourceAccountId
        const transactions = await Transaction.find({ sourceAccountId: accountId })
            .sort({ createDate: -1 });

        return {
            data: transactions
        };
    } else if (arg.url === '/get-balance') {
        // ดึงรายการ transaction ล่าสุดเพื่อคำนวณ balance
        const lastTransaction = await Transaction.find({ sourceAccountId: accountId })
            .sort({ createDate: -1 })
            .limit(1);

        const balance = lastTransaction[0]?.balance || 0;

        return {
            data: balance
        };
    } else if (arg.url === '/withdraw') {
        const {
            amount,
            sourceAccountNumber,
            bank
        } = arg.body;

        // ดึงรายการ transaction ล่าสุดเพื่อคำนวณ balance
        const lastTransaction = await Transaction.find({ sourceAccountId: accountId })
            .sort({ createDate: -1 })
            .limit(1);

        const balance = lastTransaction[0]?.balance || 0;

        if (balance < amount) {
            return { error: { status: 400, data: "ยอดเงินไม่เพียงพอ" } };
        }

        // บันทึก transaction ใหม่
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

        return {
            data: "success"
        };
    }

    return { error: { status: 404, data: 'Not found' } };
}

export const financeApi = createApi({
    reducerPath: "financeApi",
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
            withdraw: builder.mutation({
                query: ({
                    amount,
                    sourceAccountNumber,
                    bank
                }) => ({
                    url: "/withdraw",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        amount,
                        sourceAccountNumber,
                        bank
                    }
                })
            }),
        }
    }
})

export const {
    useFinanaceTransactionsQuery,
    useGetBalanceQuery,
    useWithdrawMutation,
} = financeApi;
