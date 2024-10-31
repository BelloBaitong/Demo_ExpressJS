import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from 'uuid';
// Import โมเดล Mongoose
import Influencer from "../../models/Influencer";
import Portfolio from "../../models/Portfolio";
import Account from "../../models/Account";

const mockBaseQuery = async (arg) => {
    // Handle different endpoints (arg contains the query path or params)
    if (arg.url === '/login') {
        const { email, password } = arg.body;
        const influencerData = await Influencer.findOne({ email });

        if (!influencerData) {
            return { error: { status: 400, data: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } };
        }

        if (influencerData.password !== password) {
            return { error: { status: 400, data: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } };
        }

        return {
            data: {
                accessToken: influencerData.accessToken
            }
        };
    } else if (arg.url == '/me') {
        const token = Cookies.get('accessToken');
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } };
        }

        const findToken = await Influencer.findOne({ accessToken: token });
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

        const influId = arg.params;
        const findToken = await Influencer.findOne({ influId });

        if (!findToken) {
            return { error: { status: 500, data: "Internal Server Error" } };
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
        } = arg.body;
        const token = uuidv4();

        const account = await Account.create({ type: 'influencer' });

        const registerData = await Influencer.create({
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
            accountId: account._id
        });

        return {
            data: {
                accessToken: token
            }
        };
    } else if (arg.url == '/check-email') {
        const { email } = arg.body;
        const findEmail = await Influencer.findOne({ email });

        if (findEmail) {
            return { error: { status: 400, data: "อีเมลนี้มีผู้ใช้งานอยู่แล้ว" } };
        }
        return {
            status: 200,
            data: "สามารถใช้อีเมลนี้ได้"
        };
    } else if (arg.url == '/portfolio') {
        const token = Cookies.get('accessToken');
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } };
        }

        const findToken = await Influencer.findOne({ accessToken: token });
        if (!findToken) {
            return { error: { status: 500, data: "Internal Server Error" } };
        }

        const portfolios = await Portfolio.find({ influId: findToken.influId });
        return {
            data: portfolios.map(p => ({
                title: p.title,
                description: p.description,
                firstImage: p.images[0],
                images: p.images
            }))
        };
    } else if (arg.url.includes('/view-portfolio')) {
        const influId = arg.params;
        const portfolios = await Portfolio.find({ influId });

        return {
            data: portfolios.map(p => ({
                title: p.title,
                description: p.description,
                firstImage: p.images[0],
                images: p.images
            }))
        };
    } else if (arg.url == '/add-portfolio') {
        const token = Cookies.get('accessToken');
        if (!token) {
            return { error: { status: 401, data: "unauthorize" } };
        }

        const findToken = await Influencer.findOne({ accessToken: token });
        if (!findToken) {
            return { error: { status: 500, data: "Internal Server Error" } };
        }

        const { title, description, images } = arg.body;

        await Portfolio.create({
            influId: findToken.influId,
            title,
            description,
            images
        });

        return {
            data: "success"
        };
    }

    // If the endpoint is not found
    return { error: { status: 404, data: 'Not found' } };
};

// Redux API slice
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
        };
    }
});

export const {
    useLoginMutation,
    useMeQuery,
    useRegisterMutation,
    useCheckEmailMutation,
    usePortfolioQuery,
    useAddPortfolioMutation,
    useViewProfileQuery,
    useViewPortfolioQuery
} = authApi;
