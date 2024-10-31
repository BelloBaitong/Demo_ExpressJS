const mongoose = require('mongoose')


const JobSchema = new mongoose.Schema({
    jobTitle: { type: String },
    jobDescription: { type: String },
    tag: { type: String },
    follower: { type: Number },
    totalPayment: { type: Number },
    influencerCount: { type: Number },
    paymentPerInfluencer: { type: Number },
    dueDate: { type: Date },
    files: { type: mongoose.Schema.Types.Mixed },
    marketerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Marketer' },
    isDelete: { type: Boolean, default: false },
    createDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Job = mongoose.model('Job', JobSchema);

const JobEnrollSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    influId: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer' },
    marketerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Marketer' },
    jobStatus: { type: String }
}, { timestamps: true });

const JobEnroll = mongoose.model('JobEnroll', JobEnrollSchema);


const JobDraftSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    jobEnrollId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobEnroll' },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    content: { type: String },
    pictureUrl: { type: mongoose.Schema.Types.Mixed },
    videoUrl: { type: mongoose.Schema.Types.Mixed },
    status: { type: String },
    reasonReject: { type: String },
    createDate: { type: Date, default: Date.now },
    influId: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer' },
    marketerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Marketer' }
}, { timestamps: true });

const JobDraft = mongoose.model('JobDraft', JobDraftSchema);


const JobPostSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    jobEnrollId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobEnroll' },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    postLink: { type: String },
    pictureUrl: { type: mongoose.Schema.Types.Mixed },
    createDate: { type: Date, default: Date.now },
    status: { type: String },
    reasonReject: { type: String },
    influId: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer' },
    marketerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Marketer' }
}, { timestamps: true });

const JobPost = mongoose.model('JobPost', JobPostSchema);

module.exports = {
    Job,
    JobEnroll,
    JobDraft,
    JobPost
}