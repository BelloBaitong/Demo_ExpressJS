const { Influencer } = require('../auth/authModel');
const { Job, JobEnroll, JobDraft, JobPost } = require('./jobModel');
const mongoose = require('mongoose');

class JobController {
    // ฟังก์ชันสำหรับดึงงานทั้งหมด
    async getJobs(req, res) {
        try {
            const jobs = await Job.find({ isDelete: false }).populate('marketerId');
            if (!jobs.length) {
                return res.status(404).json({ success: false, message: "ไม่พบข้อมูลงาน" });
            }
            res.status(200).json({ success: true, data: jobs });
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
            const {  jobID } = req.body;
            if (!jobID) {
                return res.status(400).json({ success: false, message: "โปรดระบุอีเมลและรหัสงาน" });
            }
            const existingEnrollment = await JobEnroll.findOne({ jobId: jobID, influId: influencerId });
            if (existingEnrollment) {
                return res.status(400).json({ success: false, message: "คุณได้สมัครงานนี้แล้ว" });
            }
            const enrollment = new JobEnroll({ jobId: jobID, influId: influencerId, jobStatus: "pending" });
            await enrollment.save();
            res.status(200).json({ success: true, message: "สมัครงานสำเร็จ" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
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
                pictureURL,
                videoURL,
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
