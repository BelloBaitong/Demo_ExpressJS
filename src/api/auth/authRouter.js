const { Router } = require('express')
const { validate_token } = require('../../middleware/validate_token')
const authController = require('./authController')

const authRouter = Router()

authRouter.post('/register',
    authController.register
)

authRouter.post('/login',
    authController.login
)

authRouter.get('/getUserInfo',
    validate_token(),
    authController.getUserInfo
)

module.exports = authRouter