const express =require('express');
const jwt = require('jsonwebtoken');
// const cookieParser = require ('cookie-parser');
const router = express.Router()
const  User = require("../model/bytesizedata.js"); ;
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());

// Connect to MongoDB
const mongoose = require("mongoose");
async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ByteSizeDB");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed", err);
  }
}

connectDB();

console.log(" Auth route file loaded");

// define the home page route
router.post('/login', async(req, res) => {
     console.log("Login endpoint hit");
    const { email, password } = req.body;
    // Here you would normally check the email and password against the database
    let response = await User.findOne({ email: email });
    if (!response) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    bcrypt.compare(password, response.password, function (err, result) {
        if (result) {
            console.log("Login successful");
            res.status(200).json({ message: "Login successful" });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
            console.log("Invalid credentials");
        }
    });
})
// define the about route
router.post('/signup', async(req, res) => {
    console.log("Signup endpoint hit");
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
                console.log("Hashed password: ", hash);
                await User.create({ email: email, password: hash });
                res.status(200).json({ message: "Signup successful" });
                
            } catch (err) {
                console.error("Error during signup:", err);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    });
})

module.exports = router