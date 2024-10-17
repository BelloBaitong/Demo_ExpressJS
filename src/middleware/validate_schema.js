const { failed } = require('../config/response')

exports.validate_schema = (schema, properties = 'body') => async (req, res, next) => {
    try {
        const { error } = schema.validate(req[properties])
        if (error) {
            return failed(res, error.details[0].message)
        }
        next()
    } catch (error) {
        return failed(res, error)
    }
}