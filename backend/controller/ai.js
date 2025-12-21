const express = require("express");
const router = express.Router();
console.log(" AI route file loaded");
console.log(" i am  from ai file  Cohere API Key:", process.env.COHERE_API_KEY);
router.post("/", (req, res) => {
  const content = req.body.content
  console.log("Content to summarize:", content);
  const { CohereClientV2 } = require('cohere-ai');
  const cohere = new CohereClientV2({
    token: process.env.COHERE_API_KEY,
  });
  (async () => {
    const response = await cohere.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: 'user',
          content: 'Summarize the following article content in a concise paragraph of 2-3 lines  \n\n' + content,
        },
      ],
    });
    console.log("Cohere response:", response);
    console.log("summary is  " + response.message.content[0].text);
    res.json({ summary: response.message.content[0].text });
  })();

});

router.get("/about", (req, res) => {
  res.send("About ai summary");
});

module.exports = router;
