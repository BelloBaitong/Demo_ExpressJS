const mongoose = require('mongoose')

const { USERNAME_MONGO, PASSWORD_MONGO, HOST_MONGO, NAME_MONGO } = process.env
const url_mongo = `mongodb+srv://${USERNAME_MONGO}:${PASSWORD_MONGO}@${HOST_MONGO}/${NAME_MONGO}?retryWrites=true&w=majority`
const prop_mongo = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // poolSize: 3
}

exports.mongoConnection = async () => {
    return await mongoose.connect(url_mongo, prop_mongo)
}

