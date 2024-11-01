const { Marketer } = require('./authModel');
const { Account } = require('../../influencer/auth/authModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ฟังก์ชันสำหรับการลงทะเบียน Marketer
async function register(req, res) {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            facebook,
            instagram,
            x,
            tiktok,
            profilePicture,
            categories,
            yourInfo,
            brand,
            brandPicture
        } = req.body;

        // ตรวจสอบว่าอีเมลนี้ถูกใช้งานแล้วหรือไม่
        const existingMarketer = await Marketer.findOne({ email });
        if (existingMarketer) {
            return res.status(400).json({ error: "Email is already in use." });
        }

        const account = new Account({ type: 'marketer' });
        await account.save();

        // แฮชรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // สร้างเอกสาร Marketer ใหม่
        const marketer = new Marketer({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            facebook,
            instagram,
            x,
            tiktok,
            profilePicture,
            categories,
            yourInfo,
            brand,
            brandPicture,
            accountId: account._id,
        });

        await marketer.save();

        const accessToken = jwt.sign({ id: marketer._id }, process.env.SIGN, { expiresIn: '120d' });

        return res.status(201).json({ accessToken });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// ฟังก์ชันสำหรับการเข้าสู่ระบบ Marketer
async function login(req, res) {
    const { email, password } = req.body;

    try {
        const marketer = await Marketer.findOne({ email });
        if (!marketer) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // เปรียบเทียบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, marketer.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        const accessToken = jwt.sign({ id: marketer._id }, process.env.SIGN, { expiresIn: '120d' });
        marketer.accessToken = accessToken;
        await marketer.save();

        return res.status(200).json({ accessToken });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// ฟังก์ชันสำหรับดึงข้อมูล Marketer ที่เข้าสู่ระบบ
async function getMe(req, res) {
    try {
        const marketer = await Marketer.findById(req.user.id);
        if (!marketer) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        return res.status(200).json(marketer);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    register,
    login,
    getMe
};
