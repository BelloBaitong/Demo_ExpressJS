import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { categories } from '../../shared/mockup/category'
import { supabase } from "../../shared/supabase";


const mockBaseQuery = async (arg) => {
    // Handle different endpoints (arg contains the query path or params)

    if (arg.url === '/jobs') {
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

        const influId = findToken.influId

        const maxFollower = Math.max(findToken.facebookFollower ?? 0, findToken.tiktokFollower ?? 0, findToken.xFollower ?? 0, findToken.instagramFollower ?? 0)

        let { data: jobs, error: errorJobs } = await supabase
            .from("job")
            .select(`
                 * ,
                marketer (
                    *
                ),
                jobEnroll (
                    *
                )
                `)
            .order('createDate', { ascending: false })


        if (errorJobs) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }



        jobs = jobs.filter((j) => {
            const enroll = j.jobEnroll.map(je => je.influId)
            if (enroll.includes(influId)) {
                return false
            } else {
                return true
            }
        })
            .filter(el => maxFollower >= el.follower)

        return {
            data: jobs
        };
    } else if (arg.url == '/categories') {
        return {
            data: categories
        }
    } else if (arg.url == '/job-enrolls') {
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

        const influId = findToken.influId

        const { data: enrollsJob, errorEnrollsJob } = await supabase
            .from("jobEnroll")
            .select(`
                *,
                marketer(
                  *
                ),
                job(
                *
                ),
                jobDraft(
                *
                ),
                jobPost(
                *
                )
                `)
            .eq("influId", influId)


        console.log('enrollsJob', enrollsJob)
        if (errorEnrollsJob) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }



        return {
            data: {
                enrollsJob: enrollsJob.filter(el => el.jobStatus == 'pending').map(el => ({ ...el, ...el.marketer, ...el.job })),
                waitDraftJob: enrollsJob.filter(el => el.jobStatus == 'wait draft').map(el => ({ ...el, ...el.marketer, ...el.job })),
                waitPostJob: enrollsJob.filter(el => el.jobStatus == 'wait post').map(el => ({ ...el, ...el.marketer, ...el.job })),
                completeJob: enrollsJob.filter(el => el.jobStatus == 'complete').map(el => ({ ...el, ...el.marketer, ...el.job })),
            }
        }
    } else if (arg.url == '/enroll') {
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

        const influId = findToken.influId
        const { jobId, marketerId } = arg.body

        const { data: enrollData, error: insertError } = await supabase
            .from("jobEnroll")
            .insert([
                {
                    jobId,
                    marketerId,
                    influId,
                    jobStatus: "pending"
                }
            ])

        if (insertError) {
            console.log('insertError', insertError)
            return { error: { status: 500, data: "Internal Server Error" } }
        }


        return {
            data: "success"
        }
    } else if (arg.url == '/cancel-enroll') {
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

        const influId = findToken.influId

        const { jobEnrollId } = arg.body

        const { data: _, errorUpdate } = await supabase
            .from("jobEnroll")
            .update({ jobStatus: "cancel" })
            .eq('jobEnrollId', jobEnrollId)
            .eq('influId', influId)

        if (errorUpdate) {
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        return {
            data: "success"
        }
    } else if (arg.url == '/save-darft') {
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

        const influId = findToken.influId

        const {
            marketerId,
            jobId,
            content,
            pictureURL,
            videoURL,
            jobEnrollId
        } = arg.body

        const { data: _, error: insertError } = await supabase
            .from("jobDraft")
            .insert([
                {
                    marketerId,
                    influId,
                    jobId,
                    content,
                    pictureURL,
                    videoURL,
                    jobEnrollId,
                    status: "pending"
                }
            ])

        if (insertError) {
            console.log('insertError', insertError)
            return { error: { status: 500, data: "Internal Server Error" } }
        }

        return {
            data: "success"
        }
    } else if (arg.url == '/save-post') {
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

        const influId = findToken.influId

        const {
            marketerId,
            jobId,
            pictureURL,
            postLink,
            jobEnrollId
        } = arg.body

        const { data: _, error: insertError } = await supabase
            .from("jobPost")
            .insert([
                {
                    marketerId,
                    influId,
                    jobId,
                    pictureURL,
                    postLink,
                    jobEnrollId,
                    status: "pending"
                }
            ])

        if (insertError) {
            console.log('insertError', insertError)
            return { error: { status: 500, data: "Internal Server Error" } }
        }


        return {
            data: "success"
        }
    }

    // You can add more mock responses for other endpoints here.
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
} = jobApi