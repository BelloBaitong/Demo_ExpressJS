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

    const foldersInfuencer = (await readdir('./src/api/influencer')).filter((f) => !f.includes('.'))
    await writeFile('./src/api/influencer/router.md', '## ROUTER ##')

    for (const e of foldersInfuencer) {
        const p = path.join(__dirname, `./influencer/${e}/${e}Router.js`)
        if (fs.existsSync(p)) {
            appendFile('./src/api/influencer/router.md', `\n \t${version}/${prefix}/${e}`)
            app.use(version + `/${prefix}` + `/influencer/${e}`, require(`./influencer/${e}/${e}Router`))
        }
    }

    const folderMarketer = (await readdir('./src/api/marketer')).filter((f) => !f.includes('.'))
    await writeFile('./src/api/marketer/router.md', '## ROUTER ##')

    for (const e of folderMarketer) {
        const p = path.join(__dirname, `./marketer/${e}/${e}Router.js`)
        if (fs.existsSync(p)) {
            appendFile('./src/api/marketer/router.md', `\n \t${version}/${prefix}/${e}`)
            app.use(version + `/${prefix}` + `/marketer/${e}`, require(`./marketer/${e}/${e}Router`))
        }
    }

}