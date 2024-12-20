const { Marketer } = require('../auth/authModel');
const { Job, JobEnroll, JobDraft, JobPost } = require('../../influencer/job/jobModel');
const mongoose = require('mongoose');
const { categories } = require('../job/categories');
// เพิ่มงานใหม่
exports.addPostJob = async (req, res) => {
    try {
        const { jobTitle, jobDescription, tag, follower, totalPayment, influencerCount, paymentPerInfluencer, dueDate, files } = req.body;
        /*if (!categories || !Array.isArray(tag) || categories.length === 0) { // เปลี่ยนจาก categories เป็น tags
            return res.status(400).json({ error: "Please select at least one categories." }); // เปลี่ยนข้อความให้สอดคล้อง
        }*/
        const job = new Job({
            marketerId: req.user.id, // มาจาก token
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
        const savedJob = await job.save();
        res.json(savedJob);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCategories = (req, res) => {
    const { value } = req.query; // ดึงพารามิเตอร์ `value` จากคำขอ
    // ถ้าพารามิเตอร์ `value` ถูกส่งมา ให้กรองหมวดหมู่
    let filteredCategories = categories;
    if (value) {
        filteredCategories = categories.filter(category =>
            category.value === value
        );
    }
    res.json(filteredCategories);
};


// เรียกดูงานทั้งหมด
exports.getJobs = async (req, res) => {
    try {
        let jobs = await Job.find({ marketerId: req.user.id, isDelete: false })
            .populate('marketerId')
        let jobEnrolls = await JobEnroll.find({ jobId: { $in: jobs.map(job => job._id) } }).populate('influId')
        let jobDrafts = await JobDraft.find({ jobId: { $in: jobs.map(job => job._id) } }).populate('influId')
        let jobPosts = await JobPost.find({ jobId: { $in: jobs.map(job => job._id) } }).populate('influId')
        jobs = jobs.map(job => ({
            ...job.toObject(),
            marketerName: job.marketerId.brand,
            jobId: job._id,
            marketer: { brand: job.marketerId.brand, marketerId: job.marketerId._id },
            jobEnroll: jobEnrolls.filter(enroll => enroll.jobId.toString() === job._id.toString()).map(enroll => ({ ...enroll.toObject(), influencer: { ...enroll.influId?.toObject(), influId: enroll.influId?._id }, jobEnrollId: enroll._id })),
            jobDraft: jobDrafts.filter(draft => draft.jobId.toString() === job._id.toString()),
            jobPost: jobPosts.filter(post => post.jobId.toString() === job._id.toString())
        }));
        console.log('jobs', jobs)
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// จ้าง influencer
exports.hireInfluencer = async (req, res) => {
    const { jobEnrollId, jobId } = req.body;
    try {
        const job = await Job.findById(jobId);
        const enrollments = await JobEnroll.find({ jobId, jobStatus: { $nin: ['reject', 'cancel', 'pending'] }, });
        if (enrollments.length >= job.influencerCount) {
            return res.status(400).json({ error: "Cannot hire more influencers than specified" });
        }
        await JobEnroll.updateOne({ _id: jobEnrollId }, { jobStatus: "wait draft" });

        // ส่งแจ้งเตือนให้ influencer ที่ถูกจ้าง
        //io.to(jobEnrollId).emit('hiredNotification', { jobId, jobEnrollId })

        res.json("success");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ปฏิเสธการสมัคร influencer
exports.rejectInfluencer = async (req, res) => {
    const { jobEnrollId } = req.body;
    try {
        await JobEnroll.updateOne({ _id: jobEnrollId }, { jobStatus: "reject" });

        // แจ้งเตือนให้ influencer 
        //io.to(jobEnrollId).emit('jobRejected', { jobEnrollId})
        res.json("success");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ลบงาน
exports.removeJob = async (req, res) => {
    const { jobId } = req.body;
    try {
        await Job.deleteOne({ _id: jobId, marketerId: req.user.id });
        res.json("success");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ตรวจสอบ draft
exports.checkDraft = async (req, res) => {
    try {
        let drafts = await JobDraft.find({ jobId: req.params.jobId, marketerId: req.user.id, status: 'pending' }).populate('influId')
        drafts = drafts
            .map(draft => ({ ...draft.toObject(), jobDraftId: draft._id, influencer: { ...draft.influId?.toObject(), influId: draft.influId?._id } }))
        res.json(drafts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// อนุมัติ draft
exports.approveDraft = async (req, res) => {
    const { jobDraftId } = req.body;
    try {
        const updatedDraft = await JobDraft.findByIdAndUpdate(jobDraftId, { status: "approve" }, { new: true });
        await JobEnroll.updateOne({ _id: updatedDraft.jobEnrollId }, { jobStatus: "wait post" });

        //io.to(updatedDraft.influId).emit('draftApproved', { jobDraftId });

        res.json("success");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ปฏิเสธ draft
exports.rejectDraft = async (req, res) => {
    const { jobDraftId, reasonReject } = req.body;
    try {
        await JobDraft.updateOne({ _id: jobDraftId }, { status: "reject", reasonReject });
        // แจ้งเตือนให้ influencer เมื่อ draft ถูกปฏิเสธ
        // io.to(jobDraftId).emit('draftRejected', { jobDraftId, reasonReject })

        res.json("success");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ตรวจสอบ post
exports.checkPost = async (req, res) => {
    try {
        let posts = await JobPost.find({ jobId: req.params.jobId, marketerId: req.user.id, status: 'pending' }).populate('influId',)
        posts = posts
            .map(post => ({ ...post.toObject(), jobPostId: post._id, influencer: { ...post.influId?.toObject(), influId: post.influId?._id, } }))
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// อนุมัติ post
exports.approvePost = async (req, res) => {
    const { jobPostId } = req.body;
    try {
        const updatedPost = await JobPost.findByIdAndUpdate(jobPostId, { status: "approve" }, { new: true });
        await JobEnroll.updateOne({ _id: updatedPost.jobEnrollId }, { jobStatus: "complete" });

        // แจ้งเตือนให้ influencer เมื่อโพสต์ได้รับการอนุมัติ
        //io.to(updatedPost.influId).emit('postApproved', { jobPostId });

        res.json("success");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ปฏิเสธ post
exports.rejectPost = async (req, res) => {
    const { jobPostId, reasonReject } = req.body;
    try {
        await JobPost.updateOne({ _id: jobPostId }, { status: "reject", reasonReject });

        // แจ้งเตือนให้ influencer เมื่อโพสต์ถูกปฏิเสธ
        //io.to(jobPostId).emit('postRejected', { jobPostId, reasonReject });

        res.json("success");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

