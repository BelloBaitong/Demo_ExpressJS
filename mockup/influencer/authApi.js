import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { supabase } from "../../shared/supabase";
import { v4 as uuidv4 } from 'uuid';

const mockBaseQuery = async (arg) => {
    // Handle different endpoints (arg contains the query path or params)
    if (arg.url === '/login') {
        const { email, password } = arg.body
        const { data: influencerData, error } = await supabase
            .from("influencer")
            .select("email, password, accessToken")
            .eq("email", email);

        if (error) {
            console.log('error', error)
            return { error: { status: 500, data: "Internal Server Error" } };
        }

        if (influencerData.length === 0) {
            return { error: { status: 400, data: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } };
        }

        const findAuth = influencerData[0]; // Supabase will return an array, so use the first entry.

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
            .from("influencer")
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
            email,
            accessToken,
            firstName,
            lastName,
            profilePicture,
            facebook,
            facebookFollower,
            instagram,
            instagramFollower,
            x,
            xFollower,
            tiktok,
            tiktokFollower,
            categories,
            yourInfo,
            accountId,
        } = findToken
        return {
            data: {
                influId,
                email,
                accessToken,
                firstName,
                lastName,
                profilePicture,
                facebook,
                facebookFollower,
                instagram,
                instagramFollower,
                x,
                xFollower,
                tiktok,
                tiktokFollower,
                categories,
                yourInfo,
                accountId,
            }
        }
    } else if (arg.url.includes('/view-profile')) {
        const token = Cookies.get('accessToken')
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } }
        }

        const influId = arg.params
        const { data: findToken, error } = await supabase
            .from("influencer")
            .select()
            .eq("influId", influId)
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
            facebookFollower,
            instagram,
            instagramFollower,
            x,
            xFollower,
            tiktok,
            tiktokFollower,
            categories,
            yourInfo,
            accountId,
        } = findToken

        return {
            data: {
                influId,
                email,
                accessToken,
                firstName,
                lastName,
                profilePicture,
                facebook,
                facebookFollower,
                instagram,
                instagramFollower,
                x,
                xFollower,
                tiktok,
                tiktokFollower,
                categories,
                yourInfo,
                accountId,
            }
        }
    } else if (arg.url == '/register') {
        const {
            email,
            password,
            firstName,
            lastName,
            facebook,
            facebookFollower,
            instagram,
            instagramFollower,
            x,
            xFollower,
            tiktok,
            tiktokFollower,
            profilePicture,
            categories,
            yourInfo
        } = arg.body
        const token = uuidv4()
        const { data: account, error: insertAccountError } = await supabase
            .from("account")
            .insert([
                {
                    type: 'influencer'
                }
            ])
            .select()
            .single()

        if (insertAccountError) {
            console.log('insertError', insertAccountError)
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        const { data: registerData, error: insertError } = await supabase
            .from("influencer")
            .insert([
                {
                    email,
                    password,
                    firstName,
                    lastName,
                    facebook,
                    facebookFollower,
                    instagram,
                    instagramFollower,
                    x,
                    xFollower,
                    tiktok,
                    tiktokFollower,
                    profilePicture,
                    categories,
                    yourInfo,
                    accessToken: token,
                    accountId: account.accountId
                }
            ])
            .select('influId')
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
            .from("influencer")
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

    } else if (arg.url == '/portfolio') {
        const token = Cookies.get('accessToken')
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } }
        }
        const { data: findToken, error } = await supabase
            .from("influencer")
            .select()
            .eq("accessToken", token)
            .single()

        if (error) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        const influId = findToken.influId
        const { data: portfolios, error2 } = await supabase
            .from("portfolio")
            .select()
            .eq("influId", influId);

        if (error2) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        return {
            data: portfolios.map((p) => {
                return {
                    title: p.title,
                    description: p.description,
                    firstImage: p.images[0],
                    images: p.images
                }
            })
        }

    } else if (arg.url.includes('/view-portfolio')) {
        const token = Cookies.get('accessToken')
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } }
        }
        const influId = arg.params
        console.log('influId', influId)
        const { data: findToken, error } = await supabase
            .from("influencer")
            .select()
            .eq("influId", influId)
            .single()

        if (error) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        const { data: portfolios, error2 } = await supabase
            .from("portfolio")
            .select()
            .eq("influId", influId);

        if (error2) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        return {
            data: portfolios.map((p) => {
                return {
                    title: p.title,
                    description: p.description,
                    firstImage: p.images[0],
                    images: p.images
                }
            })
        }

    } else if (arg.url == '/add-portfolio') {
        const token = Cookies.get('accessToken')
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } }
        }

        const { data: findToken, error } = await supabase
            .from("influencer")
            .select("influId")
            .eq("accessToken", token)
            .single()

        if (error) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        const influId = findToken.influId

        const {
            title,
            description,
            images
        } = arg.body

        const { data: portfolioData, error: insertError } = await supabase
            .from("portfolio")
            .insert([
                {
                    influId: influId,
                    title,
                    description,
                    images
                }
            ]);

        if (insertError) {
            return { error: { status: 500, data: "Failed to add portfolio" } };
        }

        return {
            data: "success"
        }

    }

    // You can add more mock responses for other endpoints here.
    return { error: { status: 404, data: 'Not found' } };
};


export const authApi = createApi({
    reducerPath: "authApi",
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
                query: (influId) => ({
                    url: `/view-profile/${influId}`,
                    method: "GET",
                    params: influId
                })
            }),
            register: builder.mutation({
                query: ({
                    email,
                    password,
                    firstName,
                    lastName,
                    facebook,
                    facebookFollower,
                    instagram,
                    instagramFollower,
                    x,
                    xFollower,
                    tiktok,
                    tiktokFollower,
                    profilePicture,
                    categories,
                    yourInfo
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
                        facebookFollower,
                        instagram,
                        instagramFollower,
                        x,
                        xFollower,
                        tiktok,
                        tiktokFollower,
                        profilePicture,
                        categories,
                        yourInfo
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
            viewPortfolio: builder.query({
                query: (influId) => ({
                    url: `/view-portfolio/${influId}`,
                    method: "GET",
                    params: influId
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
    useViewProfileQuery,
    useViewPortfolioQuery
} = authApi