const { success, failed } = require('../../config/response')
const influModel = require('./influModel')

class InfluController {
    async register(req, res) {
        try {
            //1. check username ที่กรอกว่าซ้ำกับใน database ไหม
            //ถ้าซ้ำ ต้อง response error ออกไปว่า มี username นี้ใน database แล้ว
            // ไม่ซ้ำก็ไปต่อ
            //2. save ข้อมูลลง database
            //3. response success
            const body = req.body
            const influ = await influModel.findOneInflu({ username: body.username })

            if (!!influ) {
                return failed(res, 'username is exist in database')
            }

            const result = await influModel.insertInflu(body)

            

            return success(res, 'สมัครสมาชิกสำเร็จ', result)
        } catch (error) {
            return failed(res, 'found some issue on action')
        }
    }


}

module.exports = new InfluController()