const express = require('express');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require("../model/bytesizedata.js");
const Otpdata = require("../model/otpdata.js");
const bcrypt = require("bcrypt");

function verifytoken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "No token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.email = decoded.email;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }

        return res.status(401).json({ message: "Invalid token" });
    }
}
router.post('/save_article', verifytoken, async (req, res) => {
    const user = await User.findOne({ email: req.email });
    if(!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const { title, url, description } = req.body;
    const alreadySaved = user.savedArticles.some(a => a.url === url);
    if (alreadySaved) {
        return res.status(400).json({ message: "Already saved" });
    }
    user.savedArticles.push({ title, url, description });
    await user.save();
    return res.status(200).json({ message: "Saved successfully" });
});
router.get('/saved_articles', verifytoken, async (req, res) => {
    const useremail = req.email;
    const user = await User.findOne({ email: useremail });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user.savedArticles);
});

module.exports = router;