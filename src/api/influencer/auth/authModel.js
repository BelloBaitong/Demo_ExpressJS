const mongoose = require('mongoose');

//Influencer
const InfluencerSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    accessToken: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profilePicture: { type: String },
    facebook: { type: String },
    facebookFollower: { type: Number },
    instagram: { type: String },
    instagramFollower: { type: Number },
    x: { type: String },
    xFollower: { type: Number },
    tiktok: { type: String },
    tiktokFollower: { type: Number },
    categories: { type: mongoose.Schema.Types.Mixed },
    yourInfo: { type: String },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', unique: true }
}, { timestamps: true });

const Influencer = mongoose.model('Influencer', InfluencerSchema);

//Account
const AccountSchema = new mongoose.Schema({
    type: { type: String, required: true }
}, { timestamps: true });

const Account = mongoose.model('Account', AccountSchema);

//Portfolio
const PortfolioSchema = new mongoose.Schema({
    influId: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer' },
    title: { type: String },
    description: { type: String },
    images: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);



module.exports = {
    Influencer,
    Account,
    Portfolio
};