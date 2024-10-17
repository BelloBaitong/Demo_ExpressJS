const { err, debug } = require('./debug')

exports.success = (res, message, result, code) => {
    let status_code = code || 200
    debug(`response status_code: ${status_code}`)
    res.status(status_code).json({ success: true, message, result })
}
exports.failed = (res, message, error, code) => {
    err(error || message)
    let obj = { success: false }
    if (typeof message === 'string') {
        obj = { ...obj, message }
    } else {
        const { message: ms, ...ob } = message
        ob = { ...obj, message: ms, result: ob }
    }
    return res.status(code || 400).json(obj)
}