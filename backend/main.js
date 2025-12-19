const express = require('express')
const app = express()
app.use(express.json());
const dotenv = require('dotenv').config()
const newsroute = require('./controller/news.js')
const airoute = require('./controller/ai.js')
app.use('/news', newsroute)
app.use('/ai', airoute);
const port = 5000
console.log("  I AM FROM THE MAIN.JS FILE ! News API Key:", process.env.NEWS_API_KEY);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

