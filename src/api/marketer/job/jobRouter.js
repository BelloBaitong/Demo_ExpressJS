const express = require('express');
const router = express.Router();
const jobController = require('./jobController');
const authMiddleware = require('../../../middleware/authMiddleware.js'); // Import the middleware


router.post('/add-post-job', authMiddleware, jobController.addPostJob);
router.get('/categories',authMiddleware, jobController.getTag);
router.get('/get-jobs', authMiddleware, jobController.getJobs);
router.post('/hire',authMiddleware, jobController.hireInfluencer);
router.post('/reject', authMiddleware, jobController.rejectInfluencer);
router.post('/remove-job', authMiddleware, jobController.removeJob);
router.get('/check-draft/:jobId', authMiddleware, jobController.checkDraft);
router.post('/approve-draft', authMiddleware, jobController.approveDraft);
router.post('/reject-draft', authMiddleware, jobController.rejectDraft);
router.get('/check-post/:jobId', authMiddleware, jobController.checkPost);
router.post('/approve-post', authMiddleware, jobController.approvePost);
router.post('/reject-post',authMiddleware, jobController.rejectPost);


module.exports = router;
