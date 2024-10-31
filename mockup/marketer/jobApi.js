import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { categories } from '../../shared/mockup/category';
import { connectToMongoDB } from "../../shared/mongo"; // Import your MongoDB connection

const mockBaseQuery = async (arg) => {
    const db = await connectToMongoDB(); // Make sure to connect to MongoDB
    const marketersCollection = db.collection("marketer");
    const jobsCollection = db.collection("job");
    const jobEnrollCollection = db.collection("jobEnroll");
    const jobDraftCollection = db.collection("jobDraft");
    const jobPostCollection = db.collection("jobPost");

    const token = Cookies.get('accessToken');
    if (!token) {
        return { error: { status: 401, data: "unauthorize" } };
    }

    const findToken = await marketersCollection.findOne({ accessToken: token });
    if (!findToken) {
        return { error: { status: 401, data: "unauthorize" } };
    }

    const marketerId = findToken.marketerId;

    // Handle different endpoints (arg contains the query path or params)
    switch (arg.url) {
        case '/add-post-job':
            const {
                jobTitle,
                jobDescription,
                tag,
                follower,
                totalPayment,
                influencerCount,
                paymentPerInfluencer,
                dueDate,
                files
            } = arg.body;

            const insertJob = await jobsCollection.insertOne({
                marketerId,
                jobTitle,
                jobDescription,
                tag,
                follower,
                totalPayment,
                influencerCount,
                paymentPerInfluencer,
                dueDate,
                files
            });

            return { data: insertJob.ops[0] };

        case '/categories':
            return { data: categories };

        case '/get-jobs':
            const jobs = await jobsCollection.find({ marketerId, isDelete: false }).toArray();
            return {
                data: jobs.map(el => ({
                    ...el,
                    marketerName: `${el.marketer.firstName} ${el.marketer.lastName}`,
                    markerProfileImage: el.marketer.profilePicture
                })),
            };

        case '/hire':
            const { jobEnrollId, jobId } = arg.body;
            const lastestEnroll = await jobEnrollCollection.find({ jobId }).toArray();
            const enrollCount = lastestEnroll.filter(el => !['reject', 'cancel', 'pending'].includes(el.jobStatus)).length;
            const job = await jobsCollection.findOne({ jobId });

            if (enrollCount >= job.influencerCount) {
                return { error: { status: 400, data: "Cannot hire more influencers than specified" } };
            }

            await jobEnrollCollection.updateOne(
                { jobEnrollId, marketerId },
                { $set: { jobStatus: "wait draft" } }
            );

            return { data: "success" };

        case '/reject':
            const { jobEnrollId: rejectJobEnrollId } = arg.body;

            await jobEnrollCollection.updateOne(
                { jobEnrollId: rejectJobEnrollId, marketerId },
                { $set: { jobStatus: "reject" } }
            );

            return { data: "success" };

        case '/remove-job':
            const { jobId: removeJobId } = arg.body;

            await jobsCollection.updateOne(
                { jobId: removeJobId, marketerId },
                { $set: { isDelete: true } }
            );

            return { data: "success" };

        case '/check-draft':
            const jobDraftId = arg.params;
            const drafts = await jobDraftCollection.find({ jobId: jobDraftId, marketerId }).toArray();
            return { data: drafts.filter(el => el.status === 'pending') };

        case '/approve-draft':
            const { jobDraftId: approveJobDraftId } = arg.body;

            const updatedDraft = await jobDraftCollection.findOneAndUpdate(
                { jobDraftId: approveJobDraftId },
                { $set: { status: "approve" } },
                { returnDocument: 'after' }
            );

            await jobEnrollCollection.updateOne(
                { jobEnrollId: updatedDraft.value.jobEnrollId },
                { $set: { jobStatus: "wait post" } }
            );

            return { data: "success" };

        case '/reject-draft':
            const { jobDraftId: rejectDraftId, reasonReject } = arg.body;

            await jobDraftCollection.updateOne(
                { jobDraftId: rejectDraftId },
                { $set: { status: "reject", reasonReject } }
            );

            return { data: "success" };

        case '/check-post':
            const postId = arg.params;
            const posts = await jobPostCollection.find({ jobId: postId, marketerId }).toArray();
            return { data: posts.filter(el => el.status === 'pending') };

        case '/approve-post':
            const { jobPostId } = arg.body;

            const updatedPost = await jobPostCollection.findOneAndUpdate(
                { jobPostId },
                { $set: { status: "approve" } },
                { returnDocument: 'after' }
            );

            await jobEnrollCollection.updateOne(
                { jobEnrollId: updatedPost.value.jobEnrollId },
                { $set: { jobStatus: "complete" } }
            );

            return { data: "success" };

        case '/reject-post':
            const { jobPostId: rejectPostId, reasonReject: postReasonReject } = arg.body;

            await jobPostCollection.updateOne(
                { jobPostId: rejectPostId },
                { $set: { status: "reject", reasonReject: postReasonReject } }
            );

            return { data: "success" };

        default:
            return { error: { status: 404, data: 'Not found' } };
    }
};

export const mktJobApi = createApi({
    reducerPath: "mktJobApi",
    baseQuery: mockBaseQuery,
    endpoints: (builder) => ({
        addPostJob: builder.mutation({
            query: ({ jobTitle, jobDescription, tag, follower, totalPayment, influencerCount, paymentPerInfluencer, dueDate, files }) => ({
                url: "/add-post-job",
                method: "POST",
                body: { jobTitle, jobDescription, tag, follower, totalPayment, influencerCount, paymentPerInfluencer, dueDate, files }
            })
        }),
        categories: builder.query({
            query: () => ({
                url: "/categories",
                method: 'GET'
            })
        }),
        getJobs: builder.query({
            query: () => ({
                url: "/get-jobs",
                method: "GET"
            })
        }),
        hire: builder.mutation({
            query: ({ jobEnrollId, jobId }) => ({
                url: "/hire",
                method: "POST",
                body: { jobEnrollId, jobId }
            })
        }),
        reject: builder.mutation({
            query: ({ jobEnrollId }) => ({
                url: "/reject",
                method: "POST",
                body: { jobEnrollId }
            })
        }),
        removeJob: builder.mutation({
            query: ({ jobId }) => ({
                url: "/remove-job",
                method: "POST",
                body: { jobId }
            })
        }),
        checkDraft: builder.query({
            query: (jobId) => ({
                url: `/check-draft/${jobId}`,
                method: "GET",
                params: jobId
            })
        }),
        approveDraft: builder.mutation({
            query: ({ jobDraftId }) => ({
                url: "/approve-draft",
                method: "POST",
                body: { jobDraftId }
            })
        }),
        rejectDraft: builder.mutation({
            query: ({ jobDraftId, reasonReject }) => ({
                url: "/reject-draft",
                method: "POST",
                body: { jobDraftId, reasonReject }
            })
        }),
        checkPost: builder.query({
            query: (jobId) => ({
                url: `/check-post/${jobId}`,
                method: "GET",
                params: jobId
            })
        }),
        approvePost: builder.mutation({
            query: ({ jobPostId }) => ({
                url: "/approve-post",
                method: "POST",
                body: { jobPostId }
            })
        }),
        rejectPost: builder.mutation({
            query: ({ jobPostId, reasonReject }) => ({
                url: "/reject-post",
                method: "POST",
                body: { jobPostId, reasonReject }
            })
        })
    })
});

export const {
    useCategoriesQuery,
    useAddPostJobMutation,
    useGetJobsQuery,
    useHireMutation,
    useRejectMutation,
    useRemoveJobMutation,
    useCheckDraftQuery,
    useRejectDraftMutation,
    useApproveDraftMutation,
    useCheckPostQuery,
    useRejectPostMutation,
    useApprovePostMutation
} = mktJobApi;
