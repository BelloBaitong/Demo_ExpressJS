import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { supabase } from "../../shared/supabase";
import { v4 as uuidv4 } from 'uuid';

const mockBaseQuery = async (arg) => {
    // Handle different endpoints (arg contains the query path or params)
    if (arg.url === '/login') {
        const { email, password } = arg.body
        const { data: marketerData, error } = await supabase
            .from("marketer")
            .select("email, password, accessToken")
            .eq("email", email);

        if (error) {
            console.log('error', error)
            return { error: { status: 500, data: "Internal Server Error" } };
        }

        if (marketerData.length === 0) {
            return { error: { status: 400, data: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } };
        }

        const findAuth = marketerData[0]; // Supabase will return an array, so use the first entry.

        if (findAuth.password !== password) {
            return { error: { status: 400, data: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } };
        }

        return {
            data: {
                accessToken: findAuth.accessToken
            }
        };
    } else if (arg.url == '/me') {
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
            marketerId,
            email,
            accessToken,
            firstName,
            lastName,
            profilePicture,
            facebook,
            instagram,
            x,
            tiktok,
            categories,
            yourInfo,
            accountId,
            brand,
            brandPicture
        } = findToken

        return {
            data: {
                marketerId,
                email,
                accessToken,
                firstName,
                lastName,
                profilePicture,
                facebook,
                instagram,
                x,
                tiktok,
                categories,
                yourInfo,
                accountId,
                brand,
                brandPicture
            }
        }
    } else if (arg.url.includes('/view-profile')) {
        const token = Cookies.get('accessToken')
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } }
        }

        const marketerId = arg.params
        const { data: findToken, error } = await supabase
            .from("marketer")
            .select()
            .eq("marketerId", marketerId)
            .single()

        if (error) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }


        const {
            email,
            accessToken,
            firstName,
            lastName,
            profilePicture,
            facebook,
            instagram,
            x,
            tiktok,
            categories,
            yourInfo,
            accountId,
            brand,
            brandPicture
        } = findToken

        return {
            data: {
                marketerId,
                email,
                accessToken,
                firstName,
                lastName,
                profilePicture,
                facebook,
                instagram,
                x,
                tiktok,
                categories,
                yourInfo,
                accountId,
                brand,
                brandPicture
            }
        }
    } else if (arg.url == '/register') {
        const {
            email,
            password,
            firstName,
            lastName,
            facebook,
            instagram,
            x,
            tiktok,
            profilePicture,
            categories,
            yourInfo,
            brand,
            brandPicture
        } = arg.body

        const token = uuidv4()
        const { data: account, error: insertAccountError } = await supabase
            .from("account")
            .insert([
                {
                    type: 'marketer'
                }
            ])
            .select()
            .single()

        if (insertAccountError) {
            console.log('insertError', insertAccountError)
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        const { data: registerData, error: insertError } = await supabase
            .from("marketer")
            .insert([
                {
                    email,
                    password,
                    firstName,
                    lastName,
                    facebook,
                    instagram,
                    x,
                    tiktok,
                    profilePicture,
                    categories,
                    yourInfo,
                    accessToken: token,
                    accountId: account.accountId,
                    brand,
                    brandPicture
                }
            ])
            .select('marketerId')
            .single()

        if (insertError) {
            console.log('insertError', insertError)
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        return {
            data: {
                accessToken: token
            }
        };

    } else if (arg.url == '/check-email') {
        const {
            email,
        } = arg.body
        const { data: findEmail, error } = await supabase
            .from("marketer")
            .select()
            .eq("email", email);

        if (error) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        if (findEmail.length != 0) {
            return { error: { status: 400, data: "อีเมลนี้มีผู้ใช้งานอยู่แล้ว" } }
        }
        return {
            status: 200,
            data: "สามารถใช้อีเมลนี้ได้"
        }
    }
    // You can add more mock responses for other endpoints here.
    return { error: { status: 404, data: 'Not found' } };
};


export const mktAuthApi = createApi({
    reducerPath: "mktAuthApi",
    baseQuery: mockBaseQuery,
    endpoints: (builder) => {
        return {
            login: builder.mutation({
                query: ({ email, password }) => ({
                    url: "/login",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        email,
                        password
                    }
                }),
                transformResponse: (response) => response
            }),
            me: builder.query({
                query: () => ({
                    url: "/me",
                    method: "GET"
                })
            }),
            viewProfile: builder.query({
                query: (marketerId) => ({
                    url: `/view-profile/${marketerId}`,
                    method: "GET",
                    params: marketerId
                })
            }),
            register: builder.mutation({
                query: ({
                    email,
                    password,
                    firstName,
                    lastName,
                    facebook,
                    instagram,
                    x,
                    tiktok,
                    profilePicture,
                    categories,
                    yourInfo,
                    brand,
                    brandPicture
                }) => ({
                    url: "/register",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        email,
                        password,
                        firstName,
                        lastName,
                        facebook,
                        instagram,
                        x,
                        tiktok,
                        profilePicture,
                        categories,
                        yourInfo,
                        brand,
                        brandPicture
                    }
                }),
            }),
            checkEmail: builder.mutation({
                query: ({ email }) => ({
                    url: "/check-email",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        email
                    }
                })
            }),
            portfolio: builder.query({
                query: () => ({
                    url: "/portfolio",
                    method: "GET"
                })
            }),
            addPortfolio: builder.mutation({
                query: ({
                    title,
                    description,
                    firstImage,
                    images
                }) => ({
                    url: "/add-portfolio",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        title,
                        description,
                        firstImage,
                        images
                    }
                })
            })
        }
    }
})

export const {
    useLoginMutation,
    useMeQuery,
    useRegisterMutation,
    useCheckEmailMutation,
    usePortfolioQuery,
    useAddPortfolioMutation,
    useViewProfileQuery
} = mktAuthApi