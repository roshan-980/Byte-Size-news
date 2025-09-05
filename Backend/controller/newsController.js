const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// ---------- 1. News Fetching Controller ----------
exports.fetchNews = async (req, res) => {
  const { country = 'us', topic = 'technology' } = req.query;

  const url = `https://gnews.io/api/v4/top-headlines?topic=${topic}&lang=en&country=${country}&apikey=${process.env.NEWS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.articles) {
      console.warn("⚠️ Unexpected response from GNews:", data);
      return res.status(500).json({ error: 'Invalid response from news API' });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching news from GNews:", err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};


// ---------- 2. Article Summarization Controller using Cohere API ----------
exports.summarizeArticle = async (req, res) => {
  const { content } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length < 250) {
    console.warn("⚠️ Content too short or missing");
    return res.status(400).json({ error: "Content must be a non-empty string with at least 250 characters." });
  }

  console.log("🔍 Summarizing content:", content.slice(0, 300) + '...');

  try {
    const response = await fetch("https://api.cohere.ai/v1/summarize", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
        'Cohere-Version': '2022-12-06'  // ✅ Required version header
      },
      body: JSON.stringify({
        text: content,
        length: "medium",             // short, medium, long
        format: "paragraph",          // paragraph, bullet
        model: "command-r-plus"       // ✅ Modern Cohere model
      })
    });

    const data = await response.json();
    console.log("🧠 Cohere summary response:", data);

    const summary = data?.summary;

    if (summary) {
      res.json({ summary });
    } else {
      console.error("⚠️ No valid summary received from Cohere:", data);
      res.status(500).json({ error: "No summary received", details: data });
    }

  } catch (err) {
    console.error("❌ Error during summarization with Cohere:", err);
    res.status(500).json({ error: 'Failed to summarize' });
  }
};
