const express = require('express');
const router = express.Router();
const jobController = require('./jobController');
const authMiddleware = require('../../../middleware/authMiddleware.js'); // Import the middleware

// เส้นทางดึงงานทั้งหมด
router.get('/jobs', authMiddleware, jobController.getJobs);

// เส้นทางดึงรายละเอียดงานเฉพาะจาก jobId
router.get('/jobs/:jobId', authMiddleware, jobController.getJobById);

// เส้นทางดึงงานที่ influencer สมัครไปแล้ว ใช้ในหน้า workspace
router.get('/job-enrolls', authMiddleware, jobController.getJobsEnroll);

// เส้นทางสมัครงาน
router.post('/enroll', authMiddleware, jobController.enrollJob);

// ยกเลิกการสมัครงาน
router.delete('/cancel-enroll', authMiddleware, jobController.cancelEnrollJob);

router.patch('/update-job-status', authMiddleware, jobController.updateJobStatus); // มีอันนี้ได้ไหม แชทเจนให้หรือต้องเขียนโค้ดเพิ่มไหมคะ ถ้ามีตรงนีี้

router.post('/save-draft', authMiddleware, jobController.saveDraft);

router.post('/save-post', authMiddleware, jobController.savePost);

module.exports = router;

