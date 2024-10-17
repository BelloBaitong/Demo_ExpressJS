const Joi = require('Joi')
const mongoose = require('mongoose')
const moment = require('moment')

const authSchema = mongoose.Schema({
    authen_id: String,  //for third party OAuth
    first_name: String,
    last_name: String,
    username: String,
    password: String,
    device_info: [{
        device_id: String,
        user_id: String,
        token_noti: String,
        create_date: { type: Date, default: moment() }
    }]
}, { collection: 'user' })

exports.AuthSchema = mongoose.model('user', authSchema)

exports.sch_register = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    device_id: Joi.string().required()
})
