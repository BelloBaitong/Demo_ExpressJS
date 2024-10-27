const { Marketer } = require('./authModel');
const { Account } = require('../../influencer/auth/authModel')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Class-based controller
class AuthController {
    // Register a new marketer
    static async register(req, res) {
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

            const account = new Account({ type: 'marketer' });
            await account.save();

            // Check if email already exists
            const existingMarketer = await Marketer.findOne({ email });
            if (existingMarketer) {
                return res.status(400).json({ error: "Email is already in use." });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create marketer
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

    // Login a marketer
    static async login(req, res) {
        const { email, password } = req.body;

        try {
            const marketer = await Marketer.findOne({ email });
            if (!marketer) {
                return res.status(400).json({ error: "Invalid email or password." });
            }

            // Compare passwords
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

    // Get the current logged-in marketer
    static async getMe(req, res) {
        try {
            const marketer = await Marketer.findById(req.user.id);;
            if (!marketer) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            return res.status(200).json(marketer);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

module.exports = AuthController;
