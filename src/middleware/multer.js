const multer = require('multer')

const storage = (path) => multer.diskStorage({
    destination: function (req, file, cb) {
        let dir
        if (file.originalname.match(/\.(png|jpg|jpeg)/) || file.originalname.match(/\.(JPG||PNG||JPEG)/) || file.originalname.match(/\.(csv)/)) {
            switch (file.fieldname) {
                case 'article': dir = './public/images/'
                default:
                    dir = './public/images/'
                    break
            }
            cb(null, dir)
        } else {
            dir = './public/files/'
            cb(null, dir)
        }
    },
    filename(req, file, cb) {
        const split = file.originalname.split('.').length
        const fileType = file.originalname.split('.')[split - 1]
        const newFile = `${Date.now('nano')}` + `.${fileType}`
        cb(null, newFile)
    }
})

module.exports = (path) => multer({ storage: storage(path) })