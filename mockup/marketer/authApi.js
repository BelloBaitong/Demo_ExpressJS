import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import Marketer from '../../models/Marketer'; // Import your Marketer model
import Account from '../../models/Account'; // Import your Account model

const mockBaseQuery = async (arg) => {
    await mongoose.connect(process.env.MONGO_URI); // Ensure you are connected to your MongoDB

    // Handle different endpoints (arg contains the query path or params)
    if (arg.url === '/login') {
        const { email, password } = arg.body;
        const marketerData = await Marketer.findOne({ email }).select('email password accessToken');

        if (!marketerData) {
            return { error: { status: 400, data: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } };
        }

        if (marketerData.password !== password) {
            return { error: { status: 400, data: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } };
        }

        return {
            data: {
                accessToken: marketerData.accessToken
            }
        };
    } else if (arg.url == '/me') {
        const token = Cookies.get('accessToken');
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } };
        }

        const findToken = await Marketer.findOne({ accessToken: token });

        if (!findToken) {
            return { error: { status: 401, data: "unauthorize" } };
        }

        return {
            data: findToken
        };
    } else if (arg.url.includes('/view-profile')) {
        const token = Cookies.get('accessToken');
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } };
        }

        const marketerId = arg.params;
        const findToken = await Marketer.findOne({ marketerId });

        if (!findToken) {
            return { error: { status: 404, data: "Not Found" } };
        }

        return {
            data: findToken
        };
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
        } = arg.body;

        const token = uuidv4();
        const newAccount = new Account({ type: 'marketer' });
        await newAccount.save();

        const newMarketer = new Marketer({
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
            accountId: newAccount._id,
            brand,
            brandPicture
        });

        await newMarketer.save();

        return {
            data: {
                accessToken: token
            }
        };
    } else if (arg.url == '/check-email') {
        const { email } = arg.body;
        const findEmail = await Marketer.findOne({ email });

        if (findEmail) {
            return { error: { status: 400, data: "อีเมลนี้มีผู้ใช้งานอยู่แล้ว" } };
        }
        return {
            status: 200,
            data: "สามารถใช้อีเมลนี้ได้"
        };
    }

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
});

export const {
    useLoginMutation,
    useMeQuery,
    useRegisterMutation,
    useCheckEmailMutation,
    usePortfolioQuery,
    useAddPortfolioMutation,
    useViewProfileQuery
} = mktAuthApi;
