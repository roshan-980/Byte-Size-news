// inside backend/server.js
const path = require("path");
const express = require("express");
const app = express();
// const express = require('express');
const fs = require("fs");

const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") }); 

console.log("✅ NEWS API Key:", process.env.NEWS_API_KEY); 
console.log("✅ .env exists?", fs.existsSync('./.env'));

 // 👈 Load the .env file

app.use(express.json());

// ✅ Serve frontend from ../public
app.use(express.static(path.join(__dirname, "../public")));

console.log("✅ Loaded GNEWS API Key:", process.env.NEWS_API_KEY);
console.log("🔑 COHERE_API_KEY:", process.env.COHERE_API_KEY);


// ✅ API routes
const newsRoutes = require("./routes/News");
app.use("/api/news", newsRoutes);






// ✅ For any unknown route, return index.html
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
