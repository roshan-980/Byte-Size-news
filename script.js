document.getElementById("fetchNews").addEventListener("click", async () => {
  const topic = document.getElementById("topic").value;
  const container = document.getElementById("news-container");
  container.innerHTML = "Loading...";

  const res = await fetch(`/news?q=${topic}`);
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

    // Add summarize button functionality
    card.querySelector(".summarize-btn").addEventListener("click", async () => {
      const summaryBox = card.querySelector(".summary");
      summaryBox.innerHTML = "⏳ Summarizing...";
      try {
        const result = await fetch("/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: article.content || article.description })
        });
        const data = await result.json();
        summaryBox.innerHTML = `<p><strong>Summary:</strong> ${data.summary}</p>`;

        const listenBtn = card.querySelector(".listen-btn");
const stopBtn = card.querySelector(".stop-btn");

listenBtn.disabled = false;
stopBtn.disabled = false;

let utterance = new SpeechSynthesisUtterance(data.summary);

listenBtn.addEventListener("click", () => {
  speechSynthesis.cancel(); // stop previous voice
  speechSynthesis.speak(utterance);
});

stopBtn.addEventListener("click", () => {
  speechSynthesis.cancel();
});

      } catch (err) {
        summaryBox.innerHTML = "⚠️ Summary unavailable.";
      }
    });

    container.appendChild(card);
  }
});
