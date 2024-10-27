const mongoose = require('mongoose')


const MarketerSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    email: { type: String },
    password: { type: String },
    accessToken: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    tiktok: { type: String },
    x: { type: String },
    profilePicture: { type: String },
    categories: { type: mongoose.Schema.Types.Mixed },
    yourInfo: { type: String },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', unique: true },
    brand: { type: String },
    brandPicture: { type: String }
}, { timestamps: true });

const Marketer = mongoose.model('Marketer', MarketerSchema);

module.exports = {
    Marketer
}
