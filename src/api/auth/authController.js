const authModel = require('./authModel')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const { err, debug } = require('../../config/debug')
const { success, failed } = require('../../config/response')
const { encrypted, decrypted, generateToken } = require('../../functions')

class authController {
    async register(req, res) {
        try {
            const { username, password, first_name, last_name } = req.body
            //let id = machineIdSync()
            const check_user = await authModel.findOneUser({ username: username })
            const password_encrypted = await encrypted(password)
            if (check_user.completed && !check_user.result) {
                const { result } = await authModel.registerUser({ username, password: password_encrypted, first_name, last_name })
                generateToken(req, result._id)
                return success(res, 'สมัครสมาชิกสำเร็จ', { user: result, token_id: req.token })
            } else {
                return failed(res, 'มีผู้ใช้ username นี้ในระบบแล้ว')
            }
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }
    }

    async login(req, res) {

        const { username, password, } = req.body
        try {
            const check_user = await authModel.findOneUser({ username })
            if (check_user.completed && !!check_user.result) {
                const compare_password = await decrypted(check_user.result.password, password)
                if (!compare_password) {
                    return failed(res, 'username หรือ password ไม่ถูกต้อง')
                }
                generateToken(req, check_user.result._id)
                return success(res, "เข้าสู่ระบบเรียบร้อย", { user: check_user.result, token_id: req.token })
            } else {
                return failed(res, 'username หรือ password ไม่ถูกต้อง')
            }
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }

    }

    async getUserInfo(req, res) {
        try {
            const user_id = req.user_id
            const user = await (await authModel.findOneUser({ _id: ObjectId(user_id) })).result
            return success(res, "ดึงข้อมูลผู้ใช้สำเร็จ", { user })
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }
    }

    async logout(req, res) {
        try {

        } catch (error) {

        }
    }
}

module.exports = new authController()