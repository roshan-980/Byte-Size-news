const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router()
const User = require("../model/bytesizedata.js");
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
app.use(express.json());
// define the home page route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // Here you would normally check the email and password against the database
    let response = await User.findOne({ email: email });
    if (!response) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    bcrypt.compare(password, response.password, function (err, result) {
        if (result) {
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            });
            res.status(200).json({ message: "Login successful" });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    });
})
// define the about route
router.post('/signup', async (req, res) => {
    const saltRounds = 10;
    const { email, password } = req.body;
    // to check first wether user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    };
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            // Store hash in your password DB.
            try {
                await User.create({ email: email, password: hash });
                res.status(200).json({ message: "Signup successful" });

            } catch (err) {
                res.status(500).json({ message: "Internal server error" });
            }
        });
    });
})

router.post('/reset_password', async (req, res) => {
    console.log("Reset password endpoint hit");
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(newPassword, salt, async function (err, hash) {
            try {
                await User.updateOne({ email: email }, { password: hash });
                res.status(200).json({ message: "Password reset successful" });
            } catch (err) {
                res.status(500).json({ message: "Internal server error" });
            }
        });
    });

})

router.post('/logout', (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const email = decoded.email;
        return res.status(200).json({ email: email });
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }

});
router.get('/verifytoken', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        res.status(200).json({ message: "Token is valid" });
    } catch (err) {
        // console.error("Error verifying token:", err);
        res.status(401).json({ message: "Invalid token" });
    }
});
module.exports = router