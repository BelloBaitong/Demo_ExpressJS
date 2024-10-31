require('dotenv').config()
const mongoose = require('mongoose');
const { Job } = require('./jobModel'); // แก้ไข path ให้ตรงกับไฟล์โมเดล Job
const { mongoConnection } = require('../../../db/mongo_setting')

async function seedJobs() {
    try {
            await mongoConnection()
        // ลบข้อมูลที่มีอยู่ก่อนหน้านี้ (ถ้าต้องการ)
        await Job.deleteMany({});

        const jobs = [];

        for (let i = 1; i <= 20; i++) {
            const job = {
                jobTitle: `Job Title ${i}`,
                jobDescription: `Description for Job ${i}`,
                tag: `Tag ${i}`,
                follower: Math.floor(Math.random() * 1000),
                totalPayment: Math.floor(Math.random() * 10000) + 1000,
                influencerCount: Math.floor(Math.random() * 10) + 1,
                paymentPerInfluencer: Math.floor(Math.random() * 500) + 100,
                dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
                files: { fileUrl: `http://example.com/file${i}.jpg` },
                marketerId: "6722344433dd55b541502c6d",
                isDelete: false,
            };
        
            // Save each job individually
            await Job.create(job);
        }
                console.log('Successfully seeded 20 job entries!');
    } catch (error) {
        console.error('Error seeding jobs:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedJobs();
