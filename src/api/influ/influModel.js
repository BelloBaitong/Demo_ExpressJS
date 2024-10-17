const { InfluSchema } = require('./influSchema')
const mongoose = require('mongoose')

const ObjectId = mongoose.Types.ObjectId

class InfluModel {
    async findOneInflu(obj) {
        const result = await InfluSchema.findOne(obj)
        return result
    }

    async insertInflu(obj) {
        const result = await InfluSchema.create(obj)
        return result
    }
}

module.exports = new InfluModel()

