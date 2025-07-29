const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const COHERE_API_KEY = process.env.COHERE_API_KEY;

// ✅ Fix node-fetch ESM issue using dynamic import
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

/**
 * 1️⃣ News Route: Handles both search and top headlines
 * If `q` is provided: Search by topic
 * If `q` is empty: Show top headlines for that country
 */
app.get("/news", async (req, res) => {
  const query = req.query.q;
  const country = req.query.country || "us";

  let url = "";

  if (query) {
    // Search for topic
    url = `https://gnews.io/api/v4/search?q=${query}&country=${country}&lang=en&max=5&token=${GNEWS_API_KEY}`;
  } else {
    // Top headlines
    url = `https://gnews.io/api/v4/top-headlines?country=${country}&lang=en&max=5&token=${GNEWS_API_KEY}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.articles);
  } catch (error) {
    console.error("News fetch error:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

/**
 * 2️⃣ Summarize News (in English only)
 */
app.post("/summarize", async (req, res) => {
  const { content } = req.body;

  try {
    const prompt = `Summarize this news article:\n\n${content}`;

    const cohereRes = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "command",
        prompt: prompt,
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    const data = await cohereRes.json();
    const summary = data.generations?.[0]?.text?.trim() || "Summary unavailable";

    res.json({ summary });
  } catch (error) {
    console.error("Cohere generate error:", error);
    res.status(500).json({ error: "Summarization failed." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));

