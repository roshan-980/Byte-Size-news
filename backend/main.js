const express = require('express')
const app = express()
app.use(express.json());
const dotenv = require('dotenv').config()
const path =require("path");
app.use(express.static(path.join(__dirname, "../frontend")));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const mongoose = require("mongoose");
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
  } catch (err) {
    console.error("Error connecting to MongoDB: ", err);
  }
}

connectDB();

const newsroute = require('./controller/news.js')
const authroute = require('./controller/auth.js')
const airoute = require('./controller/ai.js')
const ttsroute = require('./controller/tts.js')
const otproute = require('./controller/otp.js')
const savefeatureroute  = require('./controller/savefeature.js');
app.use('/news', newsroute)
app.use('/auth', authroute);
app.use('/ai', airoute);
app.use('/tts', ttsroute);
app.use('/otp', otproute);
app.use('/save', savefeatureroute);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
})

app.listen(process.env.port, () => {})

