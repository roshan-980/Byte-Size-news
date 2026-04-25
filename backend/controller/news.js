const axios = require('axios')
const express = require('express')
const router = express.Router()


// define the home page route
router.get('/', async (req, res) => {
    const topic = req.query.topic || 'general'
    const country = req.query.country || 'us'
    const lang = req.query.lang || 'en'
    const url = `https://gnews.io/api/v4/top-headlines?topic=${topic}&lang=${lang}&country=${country}&apikey=${process.env.NEWS_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.articles) {
            return res.status(500).json({ error: 'Invalid response from news API' });
        }
        res.json(data.articles);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching news' });
    }
})
// define the about route
router.get('/about', (req, res) => {
    res.send('About birds')
})

module.exports = router
