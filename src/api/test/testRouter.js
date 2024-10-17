const { Router } = require('express')
const testController = require('./testController')
const { validate_token } = require('../../middleware/validate_token')
const testRouter = Router()

testRouter.get('/getTest',
    validate_token(),
    testController.getTest
)

module.exports = testRouter