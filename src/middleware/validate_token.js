const jsonwebtoken = require('jsonwebtoken')
const { failed } = require('../config/response')
const { err, debug } = require('../config/debug')
const { getOriginPath } = require('../functions')
const { ignoreCheckToken } = require('../utils')


exports.validate_token = () => {
    return (req, res, next) => {
        if (!req.originalUrl) {
            return failed(res, NULL, 404)
        }
        const origin = getOriginPath(req.originalUrl)
        const checkIgnore = ignoreCheckToken.indexOf(origin) >= 0
        if (checkIgnore || req.headers.authorization === process.env.BYPASS_KEY) {
            return next()
        }
        if (req.headers && req.headers.authorization) {
            debug(`access token: ${req.headers.authorization}`)
            jsonwebtoken.verify(req.headers.authorization, process.env.SIGN, (error, decode) => {
                if (error) {
                    err('token not found', req.originalUrl)
                    failed(res, 'token not found')
                } else {
                    debug('access user_id', decode.user_id)
                    req.token = req.headers.authorization
                    req.user_id = decode.user_id
                    next()
                }
            })
        } else {
            failed(res, 'token not found')
        }
    }
}