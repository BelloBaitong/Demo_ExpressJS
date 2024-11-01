const { Influencer } = require('../auth/authModel');
const { Job, JobEnroll, JobDraft, JobPost } = require('./jobModel');
const mongoose = require('mongoose');

class JobController {
    // ฟังก์ชันสำหรับดึงงานทั้งหมด
    async getJobs(req, res) {
        try {
            const jobs = await Job.find({ isDelete: false }).populate('marketerId').sort({ createDate: -1 })
            const jobEnrolls = await JobEnroll.find({ influId: req.user.id })

            // สร้าง Map เพื่อเก็บสถานะการสมัครงานของ influencer
            const enrollmentMap = new Set(jobEnrolls.map(el => el.jobId.toString()));
            console.log(enrollmentMap);
            // กรองงานที่ influencer สมัครไปแล้ว
            const filteredJobs = jobs.filter(job => !enrollmentMap.has(job._id.toString()));

            if (!filteredJobs.length) {
                return res.status(404).json({ success: false, message: "ไม่พบข้อมูลงาน" });
            }
            res.status(200).json({ success: true, data: JSON.parse(JSON.stringify(filteredJobs)) });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
        }
    }

    async getJobsEnroll(req, res) {
        try {
            const influId = req.user.id;

            const enrollsJob = await JobEnroll.find({ influId })
                .populate('marketerId')
                .populate('jobId')

            const jobDraft = await JobDraft.find({ jobEnrollId: { $in: enrollsJob.map(el => el._id) } });
            const jobPost = await JobPost.find({ jobEnrollId: { $in: enrollsJob.map(el => el._id) } });


            if (!enrollsJob) {
                return res.status(404).json({ success: false, message: "ไม่พบข้อมูลการสมัครงาน" });
            }

            const response = {
                enrollsJob: enrollsJob.filter(el => el.jobStatus === 'pending').map(el => ({
                    _id: el._id,
                    jobId: el.jobId._id,
                    influId: el.influId,
                    marketerId: el.marketerId._id,
                    marketer: { brand: el.marketerId.brand, marketerId: el.marketerId._id },
                    jobDraftId: jobDraft.filter(draft => draft.jobEnrollId === el._id),
                    jobPostId: jobPost.filter(post => post.jobEnrollId === el._id),
                    jobStatus: el.jobStatus,
                    ...el.marketerId.toObject(),
                    ...el.jobId.toObject(),
                    jobEnrollId: el._id
                })),
                waitDraftJob: enrollsJob.filter(el => el.jobStatus === 'wait draft').map(el => ({
                    _id: el._id,
                    jobId: el.jobId._id,
                    influId: el.influId,
                    marketerId: el.marketerId._id,
                    marketer: { brand: el.marketerId.brand, marketerId: el.marketerId._id },
                    jobDraftId: jobDraft.filter(draft => draft.jobEnrollId === el._id),
                    jobPostId: jobPost.filter(post => post.jobEnrollId === el._id),
                    jobStatus: el.jobStatus,
                    ...el.marketerId.toObject(),
                    ...el.jobId.toObject(),
                    jobEnrollId: el._id,
                    jobDraft: jobDraft.filter(draft => draft.jobEnrollId.toString() === el._id.toString()),
                    jobPost: jobPost.filter(post => post.jobEnrollId.toString() === el._id.toString())
                })),
                waitPostJob: enrollsJob.filter(el => el.jobStatus === 'wait post').map(el => ({
                    _id: el._id,
                    jobId: el.jobId._id,
                    influId: el.influId,
                    marketerId: el.marketerId._id,
                    marketer: { brand: el.marketerId.brand, marketerId: el.marketerId._id },
                    jobDraftId: jobDraft.filter(draft => draft.jobEnrollId.toString() === el._id.toString()),
                    jobPostId: jobPost.filter(post => post.jobEnrollId.toString() === el._id.toString()),
                    jobStatus: el.jobStatus,
                    ...el.marketerId.toObject(),
                    ...el.jobId.toObject(),
                    jobDraft: jobDraft.filter(draft => draft.jobEnrollId.toString() === el._id.toString()),
                    jobPost: jobPost.filter(post => post.jobEnrollId.toString() === el._id.toString()),
                    jobEnrollId: el._id
                })),
                completeJob: enrollsJob.filter(el => el.jobStatus === 'complete').map(el => ({
                    _id: el._id,
                    jobId: el.jobId._id,
                    influId: el.influId,
                    marketerId: el.marketerId._id,
                    marketer: { brand: el.marketerId.brand, marketerId: el.marketerId._id },
                    jobStatus: el.jobStatus,
                    ...el.marketerId.toObject(),
                    ...el.jobId.toObject()
                }))
            };
            res.status(200).json({ success: true, data: response });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
        }
    }

    // ฟังก์ชันดึงข้อมูลรายละเอียดงานตาม jobId
    async getJobById(req, res) {
        try {
            const { jobId } = req.params;
            const job = await Job.findById(jobId).populate('marketerId');
            if (!job) {
                return res.status(404).json({ success: false, message: "ไม่พบข้อมูลงาน" });
            }
            res.status(200).json({ success: true, data: job });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
        }
    }

    // ฟังก์ชันสำหรับสมัครงาน
    async enrollJob(req, res) {
        try {
            const influencerId = req.user.id
            const { jobId, marketerId } = req.body;
            if (!jobId) {
                return res.status(400).json({ success: false, message: "โปรดระบุอีเมลและรหัสงาน" });
            }
            const existingEnrollment = await JobEnroll.findOne({ jobId: jobId, influId: influencerId });
            if (existingEnrollment) {
                return res.status(400).json({ success: false, message: "คุณได้สมัครงานนี้แล้ว" });
            }
            const enrollment = new JobEnroll({ jobId: jobId, influId: influencerId, marketerId: marketerId, jobStatus: "pending" });
            await enrollment.save();
            res.status(200).json({ success: true, message: "สมัครงานสำเร็จ" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
        }
    }

    async cancelEnrollJob(req, res) {
        try {
            const influencerId = req.user.id;
            const { jobEnrollId } = req.body;

            const updatedEnroll = await JobEnroll.findOneAndUpdate(
                {
                    _id: jobEnrollId,
                    influId: influencerId
                },
                { jobStatus: "cancel" },
                { new: true }
            );

            if (!updatedEnroll) {
                return res.status(404).json({
                    success: false,
                    message: "ไม่พบข้อมูลการสมัครงาน"
                });
            }

            res.status(200).json({
                success: true,
                message: "ยกเลิกการสมัครงานสำเร็จ"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์"
            });
        }
    }

    // ฟังก์ชันอัปเดตสถานะของการสมัครงาน
    async updateJobStatus(req, res) {
        try {
            const { jobEnrollId, status } = req.body;
            const updatedJobEnroll = await JobEnroll.findByIdAndUpdate(jobEnrollId, { jobStatus: status }, { new: true });
            if (!updatedJobEnroll) {
                return res.status(404).json({ success: false, message: "ไม่พบข้อมูลการสมัครงาน" });
            }
            res.status(200).json({ success: true, message: "อัปเดตสถานะสำเร็จ" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
        }
    }

    // ฟังก์ชันอื่นๆ สำหรับการบันทึก Draft หรือการโพสต์งาน
    async saveDraft(req, res) {
        try {
            const { marketerId, jobId, content, pictureURL, videoURL, jobEnrollId } = req.body;
            const newDraft = new JobDraft({
                marketerId,
                jobId,
                influId: req.user.id,
                content,
                pictureURL: pictureURL ? pictureURL : [],
                videoURL: videoURL ? videoURL : [],
                jobEnrollId,
                status: "pending"
            });
            await newDraft.save();
            res.status(200).json({ success: true, message: "บันทึก Draft สำเร็จ" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
        }
    }

    async savePost(req, res) {
        try {
            const { marketerId, jobId, pictureURL, postLink, jobEnrollId } = req.body;
            const newPost = new JobPost({
                marketerId,
                jobId,
                influId: req.user.id,
                pictureURL,
                postLink,
                jobEnrollId,
                status: "pending"
            });
            await newPost.save();
            res.status(200).json({ success: true, message: "บันทึกโพสต์สำเร็จ" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
        }
    }
}

module.exports = new JobController();
