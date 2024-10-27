import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { categories } from '../../shared/mockup/category'
import { supabase } from "../../shared/supabase";

const mockBaseQuery = async (arg) => {
    // Handle different endpoints (arg contains the query path or params)
    if (arg.url === '/add-post-job') {
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

        const marketerId = findToken.marketerId

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
        } = arg.body

        const { data: insertJob, error: insertError } = await supabase
            .from("job")
            .insert([
                {
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
                }
            ])
            .select()
            .single()

        if (insertError) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }


        return {
            data: insertJob
        }

    } else if (arg.url == '/categories') {
        return {
            data: categories
        }
    } else if (arg.url == '/get-jobs') {
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

        const marketerId = findToken.marketerId

        const { data: jobs, errorJobs } = await supabase
            .from("job")
            .select(`
                * ,
                marketer (
                    firstName,
                    lastName,
                    profilePicture
                ),
                jobEnroll (
                *,
                    influencer(
                     *
                    )
                ),
                jobDraft (
                    *
                ),
                jobPost(
                *
                )
                `)
            .eq("marketerId", marketerId)
            .eq("isDelete", false)
        if (errorJobs) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        return {
            data: jobs.map(el => ({
                ...el,
                marketerName: `${el.marketer.firstName} ${el.marketer.lastName}`,
                markerProfileImage: el.marketer.profilePicture
            })),



        }
    } else if (arg.url == '/hire') {
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

        const marketerId = findToken.marketerId
        const { jobEnrollId, jobId } = arg.body

        const { data: lastestEnroll, error: lastestEnrollError } = await supabase
            .from("jobEnroll")
            .select("*")
            .eq("jobId", jobId)

        if (lastestEnrollError) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        const enrollCount = lastestEnroll.filter(el => !['reject', 'cancel', 'pending'].includes(el.jobStatus)).length

        const { data: job, error: jobError } = await supabase
            .from("job")
            .select("*")
            .eq("jobId", jobId)
            .single()

        if (jobError) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        const influencerCount = job.influencerCount
        if (enrollCount >= influencerCount) {
            return { error: { status: 400, data: "ไม่สามารถจ้างงาน influencer เกินกว่าที่กำหนดไว้ได้" } }
        }



        const { data: enrollData, error: updateError } = await supabase
            .from("jobEnroll")
            .update({
                jobStatus: "wait draft"
            })
            .eq("jobEnrollId", jobEnrollId)
            .eq("marketerId", marketerId)

        if (updateError) {
            console.log('updateError', updateError)
            return { error: { status: 500, data: "Internal Server Error" } }
        }


        return {
            data: "success"
        }
    } else if (arg.url == '/reject') {
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

        const marketerId = findToken.marketerId
        const { jobEnrollId } = arg.body

        const { data: enrollData, error: updateError } = await supabase
            .from("jobEnroll")
            .update({
                jobStatus: "reject"
            })
            .eq("jobEnrollId", jobEnrollId)
            .eq("marketerId", marketerId)

        if (updateError) {
            console.log('updateError', updateError)
            return { error: { status: 500, data: "Internal Server Error" } }
        }


        return {
            data: "success"
        }
    } else if (arg.url == '/remove-job') {
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

        const marketerId = findToken.marketerId
        const { jobId } = arg.body

        const { data: jobData, error: updateError } = await supabase
            .from("job")
            .update({
                isDelete: true
            })
            .eq("jobId", jobId)
            .eq("marketerId", marketerId)

        if (updateError) {
            console.log('updateError', updateError)
            return { error: { status: 500, data: "Internal Server Error" } }
        }


        return {
            data: "success"
        }

    } else if (arg.url.includes('/check-draft')) {
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

        const marketerId = findToken.marketerId

        const jobId = arg.params
        const { data: jobs, errorJobs } = await supabase
            .from("jobDraft")
            .select(`
            * ,
           jobEnroll(
                *,
                influencer(*)
            )
            `)
            .eq("jobId", jobId)
            .eq("jobEnroll.marketerId", marketerId)

        if (errorJobs) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        return {
            data: jobs.filter(el => el.status == 'pending')
        }
    } else if (arg.url == '/approve-draft') {
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

        const { jobDraftId } = arg.body

        const { data: jobData, error: updateError } = await supabase
            .from("jobDraft")
            .update({
                status: "approve"
            })
            .eq("jobDraftId", jobDraftId)
            .select()
            .single()

        if (updateError) {
            console.log('updateError', updateError)
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        const { data: _, error: updateJobEnroll } = await supabase
            .from("jobEnroll")
            .update({
                jobStatus: "wait post"
            })
            .eq("jobEnrollId", jobData?.jobEnrollId)

        if (updateJobEnroll) {
            console.log('updateJobEnroll', updateJobEnroll)
            return { error: { status: 500, data: "Internal Server Error" } }
        }


        return {
            data: "success"
        }

    } else if (arg.url == '/reject-draft') {
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

        const { jobDraftId, reasonReject } = arg.body

        const { data: jobData, error: updateError } = await supabase
            .from("jobDraft")
            .update({
                status: "reject",
                reasonReject
            })
            .eq("jobDraftId", jobDraftId)

        if (updateError) {
            console.log('updateError', updateError)
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        return {
            data: "success"
        }

    } else if (arg.url.includes('/check-post')) {
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

        const marketerId = findToken.marketerId

        const jobId = arg.params
        const { data: jobs, errorJobs } = await supabase
            .from("jobPost")
            .select(`
            * ,
           jobEnroll(
                *,
                influencer(*)
            )
            `)
            .eq("jobId", jobId)
            .eq("jobEnroll.marketerId", marketerId)


        if (errorJobs) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        return {
            data: jobs.filter(el => el.status == 'pending')
        }
    } else if (arg.url == '/approve-post') {
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

        const { jobPostId } = arg.body

        const { data: jobData, error: updateError } = await supabase
            .from("jobPost")
            .update({
                status: "approve"
            })
            .eq("jobPostId", jobPostId)
            .select()
            .single()

        if (updateError) {
            console.log('updateError', updateError)
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        const { data: _, error: updateJobEnroll } = await supabase
            .from("jobEnroll")
            .update({
                jobStatus: "complete"
            })
            .eq("jobEnrollId", jobData?.jobEnrollId)

        if (updateJobEnroll) {
            console.log('updateJobEnroll', updateJobEnroll)
            return { error: { status: 500, data: "Internal Server Error" } }
        }


        return {
            data: "success"
        }

    } else if (arg.url == '/reject-post') {
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

        const { jobPostId, reasonReject } = arg.body

        const { data: jobData, error: updateError } = await supabase
            .from("jobPost")
            .update({
                status: "reject",
                reasonReject
            })
            .eq("jobPostId", jobPostId)

        if (updateError) {
            console.log('updateError', updateError)
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        return {
            data: "success"
        }

    }


    // You can add more mock responses for other endpoints here.
    return { error: { status: 404, data: 'Not found' } };
};


export const mktJobApi = createApi({
    reducerPath: "mktJobApi",
    baseQuery: mockBaseQuery,
    endpoints: (builder) => {
        return {
            addPostJob: builder.mutation({
                query: ({
                    jobTitle,
                    jobDescription,
                    tag,
                    follower,
                    totalPayment,
                    influencerCount,
                    paymentPerInfluencer,
                    dueDate,
                    files
                }) => ({
                    url: "/add-post-job",
                    method: "POST",
                    body: {
                        jobTitle,
                        jobDescription,
                        tag,
                        follower,
                        totalPayment,
                        influencerCount,
                        paymentPerInfluencer,
                        dueDate,
                        files
                    }
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
                    body: {
                        jobEnrollId,
                        jobId
                    }
                })
            }),
            reject: builder.mutation({
                query: ({ jobEnrollId }) => ({
                    url: "/reject",
                    method: "POST",
                    body: {
                        jobEnrollId
                    }
                })
            }),
            removeJob: builder.mutation({
                query: ({ jobId }) => ({
                    url: "/remove-job",
                    method: "POST",
                    body: {
                        jobId
                    }
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
                query: ({
                    jobDraftId
                }) => ({
                    url: "/approve-draft",
                    method: "POST",
                    body: {
                        jobDraftId
                    }
                })
            }),
            rejectDraft: builder.mutation({
                query: ({
                    jobDraftId,
                    reasonReject
                }) => ({
                    url: "/reject-draft",
                    method: "POST",
                    body: {
                        jobDraftId,
                        reasonReject
                    }
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
                query: ({
                    jobPostId
                }) => ({
                    url: "/approve-post",
                    method: "POST",
                    body: {
                        jobPostId
                    }
                })
            }),
            rejectPost: builder.mutation({
                query: ({
                    jobPostId,
                    reasonReject
                }) => ({
                    url: "/reject-post",
                    method: "POST",
                    body: {
                        jobPostId,
                        reasonReject
                    }
                })
            })
        }
    }
})

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
} = mktJobApi