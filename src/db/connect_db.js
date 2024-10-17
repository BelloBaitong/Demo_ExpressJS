const { mongoConnection } = require('./mongo_setting')
const { debug, err } = require('../config/debug')

exports.onTestDatabase = async () => {
    try {
        mongoConnection()
        debug(`CONNECT DATABASE SUCCESS`)
        return true
    } catch (error) {
        debug(`CONNECT DATABASE FAILED`)
        return false
    }
}
