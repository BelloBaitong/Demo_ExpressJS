const { err, debug } = require('../../config/debug')
const { success, failed } = require('../../config/response')

class testController {
    async getTest(req, res) {
        try {
            const user_id = req.user_id
            return success(res, 'success', { user_id })
        } catch (error) {
            return failed(res, 'found some issue on action')
        }
    }
}

module.exports = new testController()