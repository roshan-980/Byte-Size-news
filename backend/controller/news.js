const axios = require('axios')
const express = require('express')
const router = express.Router()

console.log(" News route file loaded");
console.log(" i am  from news file News API Key:", process.env.NEWS_API_KEY);
// define the home page route
router.get('/', async (req, res) => {
    const topic = req.query.topic || 'general'
    const country = req.query.country || 'us'
    const lang = req.query.lang || 'en'
    console.log("Fetching news for Topic(from news.js):", topic, "Country:", country, "Language:", lang);
    const url = `https://gnews.io/api/v4/top-headlines?topic=${topic}&lang=${lang}&country=${country}&apikey=${process.env.NEWS_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.articles) {
            console.warn(" Unexpected response from GNews:", data);
            return res.status(500).json({ error: 'Invalid response from news API' });
        }
        console.log(data);
        res.json(data.articles);
    } catch (error) {
        console.log('Error fetching news:', error)

    }
})
// define the about route
router.get('/about', (req, res) => {
    res.send('About birds')
})

module.exports = router
