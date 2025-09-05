const express = require('express');
const router = express.Router();
const { fetchNews, summarizeArticle } = require('../controllers/newsController');

router.get('/', fetchNews);
router.post('/summarize', summarizeArticle);

console.log("✅ Routes file loaded");
module.exports = router;
