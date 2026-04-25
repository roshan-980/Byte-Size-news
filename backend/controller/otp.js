const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router()
const User = require("../model/bytesizedata.js");
const Otpdata = require("../model/otpdata.js");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
app.use(express.json());

router.post('/gen', async (req, res) => {
    const { email } = req.body;
    await Otpdata.deleteMany({ email });
    let verify_email = await User.findOne({ email: email });
    if (verify_email) {
        return res.status(400).json({ message: "User already exists" });
    }
    // gen otp
    const otp = Math.floor(Math.random() * (9999 - 1001 + 1)) + 1001;
    try {
        // save otp to db
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(otp.toString(), salt);
        await Otpdata.create({ email, otp: hash });
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'playerpro9800@gmail.com',
                pass: process.env.OTP_SEND_API_KEY
            }
        });

        let mailOptions = {
            from: 'playerpro9800@gmail.com',
            to: email,
            subject: 'Sending Email using Node.js',
            text: `Your OTP is: ${otp}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.status(500).json({ message: "Error sending OTP email" });
            } else {
                return res.status(200).json({ message: "OTP sent successfully" });
            }
        });
    }
    catch (err) {
        res.status(500).json({ message: "Error generating OTP" });
    }

});
router.post('/gen_forgetpw', async (req, res) => {
    const { email } = req.body;
    await Otpdata.deleteMany({ email });
    let verify_email = await User.findOne({ email: email });
    if (!verify_email) {
        return res.status(400).json({ message: "User doesn't exist" });
    }
    // gen otp
    const otp = Math.floor(Math.random() * (9999 - 1001 + 1)) + 1001;
    try {
        // save otp to db
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(otp.toString(), salt);
        await Otpdata.create({ email, otp: hash });
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'playerpro9800@gmail.com',
                pass: process.env.OTP_SEND_API_KEY
            }
        });

        let mailOptions = {
            from: 'playerpro9800@gmail.com',
            to: email,
            subject: 'Sending Email using Node.js',
            text: `Your OTP is: ${otp}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.status(500).json({ message: "Error sending OTP email" });
            } else {
                return res.status(200).json({ message: "OTP sent successfully" });
            }
        });
    }
    catch (err) {
        res.status(500).json({ message: "Error generating OTP" });
    }

});

router.post('/verify', async (req, res) => {
    const { email, otp } = req.body;
    let verify_email = await Otpdata.findOne({ email: email });
    if (!verify_email) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(otp, verify_email.otp);

    if (isMatch) {
        const token = jwt.sign({ email: email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,        
            sameSite: "None"     
        });
        await Otpdata.deleteOne({ email });
        return res.status(200).json({ message: "OTP verification successful" });
    } else {
        return res.status(401).json({ message: "Invalid OTP" });
    }
    await Otpdata.deleteOne({ email });


})


module.exports = router