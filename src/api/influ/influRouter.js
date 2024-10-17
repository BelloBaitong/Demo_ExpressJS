const { Router } = require('express')
const influController = require('./influController')
const influRouter = Router()

influRouter.post('/register', influController.register)




module.exports = influRouter