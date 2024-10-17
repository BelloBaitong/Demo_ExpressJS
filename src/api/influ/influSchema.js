const mongoose = require('mongoose')
const moment = require('moment')

const influSchema = mongoose.Schema({
    influ_id: String,
    first_name: String,
    last_name: String,
    username: String,
    password: String,
}, { collection: "influencer" })

exports.InfluSchema = mongoose.model('influencer', influSchema)