const express = require('express')
const app = express()
app.use(express.json());
const dotenv = require('dotenv').config()
const path =require("path");
app.use(express.static(path.join(__dirname, "../frontend")));

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

const newsroute = require('./controller/news.js')
const authroute = require('./controller/auth.js')
const airoute = require('./controller/ai.js')
const ttsroute = require('./controller/tts.js')
const otproute = require('./controller/otp.js')
app.use('/news', newsroute)
app.use('/auth', authroute);
app.use('/ai', airoute);
app.use('/tts', ttsroute);
app.use('/otp', otproute);
const port = 5000;
console.log("  I AM FROM THE MAIN.JS FILE ! News API Key:", process.env.NEWS_API_KEY);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

