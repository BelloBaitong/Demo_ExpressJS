import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { categories } from '../../shared/mockup/category';
import Influencer from "../../models/Influencer"; // โมเดล Influencer
import Job from "../../models/Job"; // โมเดล Job
import JobEnroll from "../../models/JobEnroll"; // โมเดล JobEnroll
import JobDraft from "../../models/JobDraft"; // โมเดล JobDraft
import JobPost from "../../models/JobPost"; // โมเดล JobPost

const mockBaseQuery = async (arg) => {
    const token = Cookies.get('accessToken');
    if (!token) {
        return { error: { status: 401, data: "unauthorize" } };
    }

    const findToken = await Influencer.findOne({ accessToken: token });
    if (!findToken) {
        return { error: { status: 401, data: "unauthorize" } };
    }

    const influId = findToken.influId;
    const maxFollower = Math.max(findToken.facebookFollower ?? 0, findToken.tiktokFollower ?? 0, findToken.xFollower ?? 0, findToken.instagramFollower ?? 0);

    if (arg.url === '/jobs') {
        // ดึงงานทั้งหมดและกรองตามผู้ใช้งาน
        let jobs = await Job.find()
            .populate('marketer')
            .populate('jobEnroll');

        if (!jobs) {
            return { error: { status: 500, data: "Internal Server Error" } };
        }

        jobs = jobs.filter((j) => {
            const enroll = j.jobEnroll.map(je => je.influId);
            return !enroll.includes(influId) && maxFollower >= j.follower;
        });

        return { data: jobs };
    } else if (arg.url === '/categories') {
        return { data: categories };
    } else if (arg.url === '/job-enrolls') {
        const enrollsJob = await JobEnroll.find({ influId })
            .populate('marketer')
            .populate('job')
            .populate('jobDraft')
            .populate('jobPost');

        if (!enrollsJob) {
            return { error: { status: 500, data: "Internal Server Error" } };
        }

        return {
            data: {
                enrollsJob: enrollsJob.filter(el => el.jobStatus === 'pending').map(el => ({ ...el.toObject(), ...el.marketer, ...el.job })),
                waitDraftJob: enrollsJob.filter(el => el.jobStatus === 'wait draft').map(el => ({ ...el.toObject(), ...el.marketer, ...el.job })),
                waitPostJob: enrollsJob.filter(el => el.jobStatus === 'wait post').map(el => ({ ...el.toObject(), ...el.marketer, ...el.job })),
                completeJob: enrollsJob.filter(el => el.jobStatus === 'complete').map(el => ({ ...el.toObject(), ...el.marketer, ...el.job })),
            }
        };
    } else if (arg.url === '/enroll') {
        const { jobId, marketerId } = arg.body;

        const newEnroll = new JobEnroll({
            jobId,
            marketerId,
            influId,
            jobStatus: "pending"
        });

        await newEnroll.save();

        return { data: "success" };
    } else if (arg.url === '/cancel-enroll') {
        const { jobEnrollId } = arg.body;

        const updatedEnroll = await JobEnroll.findOneAndUpdate(
            { jobEnrollId, influId },
            { jobStatus: "cancel" },
            { new: true }
        );

        if (!updatedEnroll) {
            return { error: { status: 500, data: "Internal Server Error" } };
        }

        return { data: "success" };
    } else if (arg.url === '/save-darft') {
        const {
            marketerId,
            jobId,
            content,
            pictureURL,
            videoURL,
            jobEnrollId
        } = arg.body;

        const newDraft = new JobDraft({
            marketerId,
            influId,
            jobId,
            content,
            pictureURL,
            videoURL,
            jobEnrollId,
            status: "pending"
        });

        await newDraft.save();

        return { data: "success" };
    } else if (arg.url === '/save-post') {
        const {
            marketerId,
            jobId,
            pictureURL,
            postLink,
            jobEnrollId
        } = arg.body;

        const newPost = new JobPost({
            marketerId,
            influId,
            jobId,
            pictureURL,
            postLink,
            jobEnrollId,
            status: "pending"
        });

        await newPost.save();

        return { data: "success" };
    }

    return { error: { status: 404, data: 'Not found' } };
};

export const jobApi = createApi({
    reducerPath: "jobApi",
    baseQuery: mockBaseQuery,
    endpoints: (builder) => {
        return {
            jobs: builder.query({
                query: () => ({
                    url: "/jobs",
                    method: "GET",
                })
            }),
            categories: builder.query({
                query: () => ({
                    url: "/categories",
                    method: 'GET'
                })
            }),
            jobEnrolls: builder.query({
                query: () => ({
                    url: "/job-enrolls",
                    method: 'GET'
                })
            }),
            enroll: builder.mutation({
                query: ({ jobId, marketerId }) => ({
                    url: "/enroll",
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        jobId,
                        marketerId
                    }
                })
            }),
            cancelEnroll: builder.mutation({
                query: ({ jobEnrollId }) => ({
                    url: "/cancel-enroll",
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        jobEnrollId,
                    }
                })
            }),
            saveDraft: builder.mutation({
                query: ({
                    marketerId,
                    jobId,
                    content,
                    pictureURL,
                    videoURL,
                    jobEnrollId
                }) => ({
                    url: "/save-darft",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        marketerId,
                        jobId,
                        content,
                        pictureURL,
                        videoURL,
                        jobEnrollId
                    }
                })
            }),
            savePost: builder.mutation({
                query: ({
                    marketerId,
                    jobId,
                    pictureURL,
                    postLink,
                    jobEnrollId
                }) => ({
                    url: "/save-post",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        marketerId,
                        jobId,
                        pictureURL,
                        postLink,
                        jobEnrollId
                    }
                })
            })
        }
    }
})

export const {
    useJobsQuery,
    useCategoriesQuery,
    useJobEnrollsQuery,
    useEnrollMutation,
    useCancelEnrollMutation,
    useSaveDraftMutation,
    useSavePostMutation
} = jobApi;
