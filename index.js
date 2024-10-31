require('dotenv').config()

const express = require('express')
const http = require('http')
const cors = require('cors')
const ratelimit = require('express-rate-limit')
const helmet = require('helmet')
const path = require('path')
const httpContext = require('express-http-context')
const fs = require('fs')
const bodyparser = require('body-parser')
const { create } = require('domain')
const short_uuid = require('short-uuid')
const multer = require('multer')
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer')

const { debug } = require('./src/config/debug')
const { onTestDatabase } = require('./src/db/connect_db')
const { createApi } = require('./src/api')
const app = express()


// สร้าง server ด้วย http เพื่อรองรับ socket.io
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // กำหนด origin ที่อนุญาต
        methods: ['GET', 'POST']
    }
})


/*SETTING */
app.use(helmet())
app.use(bodyparser.urlencoded({ extended: true, limit: '50mb' }))
app.use(bodyparser.json({ limit: '50mb' }))

app.use(httpContext.middleware)
app.use((req, res, next) => {
    httpContext.set('request_id', short_uuid().new())
    next()
})

const whitelist = ['http://localhost:3000']
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(debug('Not allowed by CORS'))
        }
    }
}
app.use(cors())

const limiter = ratelimit({
    windowMs: 60 * 1000,
    max: 200
})

app.use(limiter)

/* Database */
onTestDatabase()

/* config mornitor */
// app.use('/api/v1/health',async(req,res)=>{
//     try {

//     } catch (error) {

//     }
// })
// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // หรือ 'smtp.example.com' สำหรับ SMTP Server อื่น ๆ
    auth: {
        user: process.env.EMAIL_USER, // ที่อยู่อีเมลของคุณ
        pass: process.env.EMAIL_PASSWORD, // รหัสผ่านหรือ App Password
    },
});

// สร้างฟังก์ชันสำหรับส่งอีเมล
async function sendEmailNotification(to, subject, message) {
    const mailOptions = {
        from: process.env.EMAIL_USER, // อีเมลผู้ส่ง
        to, // อีเมลผู้รับ
        subject, // หัวข้ออีเมล
        text: message, // เนื้อหาอีเมล (แบบ text)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

module.exports = sendEmailNotification;



/* Socket.IO logic */
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)

    // ตัวอย่างการส่ง event เมื่อมีการจ้างงานใหม่
    socket.on('newHireNotification', (data) => {
        socket.broadcast.emit('newHire', data) // แจ้งเตือน influencer คนอื่น ๆ
    })

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id)
    })
})
createApi(app, io) // ส่ง io ให้ router


/* Debuging */
app.use((req, res, next) => {
    debug(`api is called %O`, req.originalUrl)
    next()
})

//cloud storage
cloudinary.config({ cloud_name: process.env.CLOUD_NAME, api_key: process.env.CLOUD_API_KEY, api_secret: process.env.CLOUD_SECRET_KEY })

app.use('/api/v1/static', express.static(path.join(__dirname, './public')))
createApi(app)



app.get('/', (req, res) => {
    return res.send('hello world test')
})

app.get("/get-portfolio", (req, res) => {
    //business
    return res.json([
        {
            title: "test1",
            description: "test1",
            imageUrl: ["url1", "url2", "url3"]
        },
        {
            title: "test2",
            description: "test2",
            imageUrl: ["url1", "url2", "url3"]
        },
        {
            title: "test3",
            description: "test3",
            imageUrl: ["url1", "url2", "url3"]
        },
    ])
})


// app.get('/api/v1/fefu/test', (req, res) => {
//     return res.status(200).json({ success: true })
// })

app.listen(process.env.PORT, () => {
    debug(`Server is running port ${process.env.PORT}`)
})