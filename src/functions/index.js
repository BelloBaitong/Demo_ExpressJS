require('dotenv').config()
const bcrypt = require('bcryptjs')
const dayjs = require('dayjs')
const jsonwebtoken = require('jsonwebtoken')
const authModel = require('../api/auth/authModel')

exports.getOriginPath = (originalUrl) => {
    let replace = originalUrl.replace(`/api/v1/${process.env.PREFIX}`, '')
    if (replace.includes('?')) {
        const length = replace.length
        const str = replace
        replace = ''
        for (let x = 0; x < length; x++) {
            if (str[x] === '?') {
                break
            }
            replace += str[x]
        }
    }
    return replace
}

exports.encrypted = async (password) => {
    const salt = bcrypt.genSaltSync(10)
    const password_encrypted = bcrypt.hashSync(password, salt)
    return password_encrypted
}

exports.decrypted = async (hashpassword, password) => {
    return bcrypt.compareSync(password, hashpassword)
}

exports.generateToken = (req, user_id) => {
    let objToken = { user_id }
    req.token = jsonwebtoken.sign(objToken, process.env.SIGN, { expiresIn: '120d' })
    req.token_date = dayjs().format('YYYY-MM-DD HH:mm:ss')
    return
}