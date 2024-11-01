const { Influencer, Account, Portfolio } = require('./authModel')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class AuthController {
    async login(req, res) {
        const { email, password } = req.body;
        try {
            const influencer = await Influencer.findOne({ email });
            if (!influencer || !(await bcrypt.compare(password, influencer.password))) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const accessToken = jwt.sign({ id: influencer._id }, process.env.SIGN, { expiresIn: '120d' });
            influencer.accessToken = accessToken;
            await influencer.save();

            res.status(200).json({ accessToken });
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    async register(req, res) {
        const { email, password, firstName, lastName, profilePicture, facebook, facebookFollower, instagram, instagramFollower, x, xFollower, tiktok, tiktokFollower, categories, yourInfo } = req.body;
        try {
            const existingInfluencer = await Influencer.findOne({ email });
            if (existingInfluencer) {
                return res.status(400).json({ error: "Email is already in use." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const account = new Account({ type: 'influencer' });
            await account.save();

            const influencer = new Influencer({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                profilePicture,
                facebook,
                facebookFollower,
                instagram,
                instagramFollower,
                x,
                xFollower,
                tiktok,
                tiktokFollower,
                categories,
                yourInfo,
                accountId: account._id,
            });

            await influencer.save();

            const accessToken = jwt.sign({ id: influencer._id }, process.env.SIGN, { expiresIn: '120d' });

            res.status(201).json({ accessToken: accessToken });
        } catch (err) {
            console.log('err', err)
            res.status(500).json({ message: 'Registration failed' });
        }
    }

    async me(req, res) {
        try {
            const influencer = await Influencer.findById(req.user.id); // Use the user ID from the middleware
            if (!influencer) return res.status(401).json({ message: 'Unauthorized' });

            res.status(200).json(influencer);
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    async addPortfolio(req, res) {
        const { title, description, images } = req.body;

        try {
            const portfolio = new Portfolio({
                influId: req.user.id, // Use the user ID from the middleware
                title,
                description,
                images
            });

            await portfolio.save();
            res.status(201).json({ message: 'Portfolio added' });
        } catch (err) {
            res.status(500).json({ message: 'Failed to add portfolio' });
        }
    }

    async viewPortfolio(req, res) {
        try {
            const portfolios = await Portfolio.find({ influId: req.user.id });

            if (!portfolios) return res.status(404).json({ message: 'No portfolios found' });

            res.status(200).json(portfolios);
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = new AuthController();