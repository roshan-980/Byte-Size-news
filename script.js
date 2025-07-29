// public/script.js

let detectedCountry = "us"; // fallback to US

async function detectUserCountry() {
  try {
    const res = await fetch("https://ipapi.co/json");
    const data = await res.json();
    detectedCountry = data.country_code.toLowerCase();
    document.getElementById("country").value = detectedCountry;
    // Automatically fetch news when country is detected
    fetchNewsByTopic();
  } catch (err) {
    console.warn("Could not detect country, defaulting to US");
    fetchNewsByTopic();
  }
}

async function fetchNewsByTopic() {
  const topic = document.getElementById("topic").value || "technology";
  const country = document.getElementById("country").value || detectedCountry;
  const container = document.getElementById("news-container");

  container.innerHTML = "Loading...";

  try {
    const res = await fetch(`/news?q=${topic}&country=${country}`);
    const articles = await res.json();
    container.innerHTML = "";

    for (const article of articles) {
      const card = document.createElement("div");
      card.className = "news-card";

      card.innerHTML = `
        <h3>${article.title}</h3>
        <p>${article.description || "No description available."}</p>
        <a href="${article.url}" target="_blank">🔗 Read full</a>
        <div class="buttons">
          <button class="summarize-btn">📝 Summarize</button>
          <button class="listen-btn" disabled>🔊 Listen</button>
          <button class="stop-btn" disabled>🔇 Stop</button>
        </div>
        <div class="summary"></div>
      `;

      const summarizeBtn = card.querySelector(".summarize-btn");
      const listenBtn = card.querySelector(".listen-btn");
      const stopBtn = card.querySelector(".stop-btn");
      const summaryBox = card.querySelector(".summary");

      summarizeBtn.addEventListener("click", async () => {
        summaryBox.innerHTML = "⏳ Summarizing...";
        try {
          const result = await fetch("/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: article.content || article.description || article.title
            })
          });

          const data = await result.json();
          summaryBox.innerHTML = `<p><strong>Summary:</strong> ${data.summary}</p>`;

          const utterance = new SpeechSynthesisUtterance(data.summary);

          listenBtn.disabled = false;
          stopBtn.disabled = false;

          listenBtn.onclick = () => {
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
          };

          stopBtn.onclick = () => {
            speechSynthesis.cancel();
          };

        } catch (err) {
          summaryBox.innerHTML = "⚠️ Summary unavailable.";
        }
      });

      container.appendChild(card);
    }
  } catch (err) {
    container.innerHTML = "⚠️ Failed to load news.";
    console.error(err);
  }
}

document.getElementById("fetchNews").addEventListener("click", fetchNewsByTopic);

// Auto-run on load
detectUserCountry();
