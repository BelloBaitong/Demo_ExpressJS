import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { supabase } from "../../shared/supabase";

const mockBaseQuery = async (arg) => {
    if (arg.url == '/finance-transaction') {
        const token = Cookies.get('accessToken')
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } }
        }
        const { data: findToken, error } = await supabase
            .from("marketer")
            .select()
            .eq("accessToken", token)
            .single()

        if (error) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        if (!findToken) {
            return { error: { status: 401, data: "unauthorize" } }
        }

        const accountId = findToken.accountId

        console.log('accountId', accountId)
        const { data: transaction, error: transactionError } = await supabase
            .from("transaction")
            .select()
            .eq("sourceAccountId", accountId)
            .order("createDate", { ascending: false })

        return {
            data: transaction
        }
    } else if (arg.url == '/get-balance') {
        const token = Cookies.get('accessToken')
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } }
        }
        const { data: findToken, error } = await supabase
            .from("marketer")
            .select()
            .eq("accessToken", token)
            .single()

        if (error) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        if (!findToken) {
            return { error: { status: 401, data: "unauthorize" } }
        }

        const accountId = findToken.accountId

        const { data: lastTransaction, error: lastTransactionError } = await supabase
            .from("transaction")
            .select()
            .eq("sourceAccountId", accountId)
            .order("createDate", { ascending: false })

        const balance = lastTransaction[0]?.balance || 0

        return {
            data: balance
        }
    } else if (arg.url == '/deposit') {
        const token = Cookies.get('accessToken')
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } }
        }
        const { data: findToken, error } = await supabase
            .from("marketer")
            .select()
            .eq("accessToken", token)
            .single()

        if (error) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        if (!findToken) {
            return { error: { status: 401, data: "unauthorize" } }
        }

        const accountId = findToken.accountId

        const {
            amount,
            sourceAccountNumber,
            bank
        } = arg.body

        const { data: lastTransaction, error: lastTransactionError } = await supabase
            .from("transaction")
            .select()
            .eq("sourceAccountId", accountId)
            .order("createDate", { ascending: false })

        const balance = lastTransaction[0]?.balance || 0

        const { data: insertTransaction, error: insertTransactionError } = await supabase
            .from("transaction")
            .insert([
                {
                    amount: amount,
                    balance: balance + amount,
                    transactionType: 'deposit',
                    sourceAccountId: accountId,
                    destinationAccountId: null,
                    status: "success",
                    remark: `ฝากเงิน จาก ${bank} เลขบัญชี ${sourceAccountNumber}`
                }
            ])

        if (insertTransactionError) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }


        return {
            data: "success"
        }
    } else if (arg.url == '/consume-credit') {
        const token = Cookies.get('accessToken')
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } }
        }
        const { data: findToken, error } = await supabase
            .from("marketer")
            .select()
            .eq("accessToken", token)
            .single()

        if (error) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        if (!findToken) {
            return { error: { status: 401, data: "unauthorize" } }
        }

        const accountId = findToken.accountId

        const {
            amount,
            referenceJobId
        } = arg.body
        const { data: lastTransaction, error: lastTransactionError } = await supabase
            .from("transaction")
            .select()
            .eq("sourceAccountId", accountId)
            .order("createDate", { ascending: false })

        const balance = lastTransaction[0]?.balance || 0

        if (amount > balance) {
            return { error: { status: 400, data: "เงินคงเหลือไม่เพียงพอ" } }
        }

        const { data: insertTransaction, error: insertTransactionError } = await supabase
            .from("transaction")
            .insert([
                {
                    amount: amount,
                    balance: balance - amount,
                    transactionType: 'consume',
                    sourceAccountId: accountId,
                    destinationAccountId: null,
                    status: "success",
                    remark: `หักเงินออก จากเครดิต`,
                    referenceJobId: referenceJobId
                }
            ])

        if (insertTransactionError) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }


        return {
            data: "success"
        }
    } else if (arg.url == '/withdraw') {
        const token = Cookies.get('accessToken')
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } }
        }
        const { data: findToken, error } = await supabase
            .from("marketer")
            .select()
            .eq("accessToken", token)
            .single()

        if (error) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        if (!findToken) {
            return { error: { status: 401, data: "unauthorize" } }
        }

        const accountId = findToken.accountId

        const {
            amount,
            sourceAccountNumber,
            bank
        } = arg.body

        const { data: lastTransaction, error: lastTransactionError } = await supabase
            .from("transaction")
            .select()
            .eq("sourceAccountId", accountId)
            .order("createDate", { ascending: false })

        const balance = lastTransaction[0]?.balance || 0

        const { data: insertTransaction, error: insertTransactionError } = await supabase
            .from("transaction")
            .insert([
                {
                    amount: amount,
                    balance: balance - amount,
                    transactionType: 'withdraw',
                    sourceAccountId: accountId,
                    destinationAccountId: null,
                    status: "success",
                    remark: `ถอนเงิน ไปยัง ${bank} เลขบัญชี ${sourceAccountNumber}`
                }
            ])

        if (insertTransactionError) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }


        return {
            data: "success"
        }
    } else if (arg.url == '/approve-pay-credit') {
        const token = Cookies.get('accessToken')
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } }
        }
        const { data: findToken, error } = await supabase
            .from("marketer")
            .select()
            .eq("accessToken", token)
            .single()

        if (error) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        if (!findToken) {
            return { error: { status: 401, data: "unauthorize" } }
        }

        const {
            influId,
            jobId,
            referenceJobEnrollId
        } = arg.body

        const { data: influ, errorInflu } = await supabase
            .from("influencer")
            .select()
            .eq("influId", influId)
            .single()

        if (errorInflu) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        const accountId = influ.accountId

        const { data: lastTransaction, error: lastTransactionError } = await supabase
            .from("transaction")
            .select()
            .eq("sourceAccountId", accountId)
            .order("createDate", { ascending: false })

        const balance = lastTransaction[0]?.balance || 0

        const { data: job, error: jobError } = await supabase
            .from("job")
            .select()
            .eq("jobId", jobId)
            .single()

        if (jobError) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        const amount = job.paymentPerInfluencer

        const { data: insertTransaction, error: insertTransactionError } = await supabase
            .from("transaction")
            .insert([
                {
                    amount: amount,
                    balance: balance + amount,
                    transactionType: 'receive',
                    sourceAccountId: accountId,
                    destinationAccountId: null,
                    status: "success",
                    remark: `ได้รับเงิน  จากการทำงานหมายเลข ${jobId} ${job?.jobTitle}`,
                    referenceJobId: jobId,
                    referenceJobEnrollId: referenceJobEnrollId
                }
            ])

        if (insertTransactionError) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }


        return {
            data: "success"
        }
    }
    return { error: { status: 404, data: 'Not found' } };
}


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
                query: ({
                    amount,
                    sourceAccountNumber,
                    bank
                }) => ({
                    url: "/deposit",
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
            consumeCredit: builder.mutation({
                query: ({
                    amount,
                    referenceJobId
                }) => ({
                    url: "/consume-credit",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        amount,
                        referenceJobId
                    }
                })
            }),
            approvePaycredit: builder.mutation({
                query: ({
                    influId,
                    jobId,
                    referenceJobEnrollId
                }) => ({
                    url: "/approve-pay-credit",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        influId,
                        jobId,
                        referenceJobEnrollId
                    }
                })
            })
        }
    }
})

export const {
    useFinanaceTransactionsQuery,
    useGetBalanceQuery,
    useDepositMutation,
    useWithdrawMutation,
    useConsumeCreditMutation,
    useApprovePaycreditMutation
} = mktFinanceApi