const express = require('express')
const app = express()
app.use(express.json());
const dotenv = require('dotenv').config()
const path =require("path");
app.use(express.static(path.join(__dirname, "../frontend")));

const newsroute = require('./controller/news.js')
const airoute = require('./controller/ai.js')
const ttsroute = require('./controller/tts.js')
app.use('/news', newsroute)
app.use('/ai', airoute);
app.use('/tts', ttsroute);
const port = 5000
console.log("  I AM FROM THE MAIN.JS FILE ! News API Key:", process.env.NEWS_API_KEY);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

