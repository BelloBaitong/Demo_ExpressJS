const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { validate_token } = require('../middleware/validate_token')
require('dotenv').config()
const prefix = process.env.PREFIX

exports.createApi = async (app, version = '/api/v1') => {
    // app.use(validate_token)
    const readdir = promisify(fs.readdir)
    const writeFile = promisify(fs.writeFile)
    const appendFile = promisify(fs.appendFile)

    const folders = (await readdir('./src/api')).filter((f) => !f.includes('.'))
    await writeFile('./src/api/router.md', '## ROUTER ##')

    for (const e of folders) {
        const p = path.join(__dirname, `./${e}/${e}Router.js`)
        if (fs.existsSync(p)) {
            appendFile('./src/api/router.md', `\n \t${version}/${prefix}/${e}`)
            app.use(version + `/${prefix}` + `/${e}`, require(`./${e}/${e}Router`))
        }
    }
}