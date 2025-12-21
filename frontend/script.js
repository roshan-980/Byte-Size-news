console.log("Script loaded successfully");
async function loadnews(topic, country, lang) {
    console.log(" i am from loadnews function");
    console.log("Topic:", topic, "Country:", country, "Language:", lang);
    try {
        const getnews = await fetch(`/news?topic=${topic}&country=${country}&lang=${lang}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        const articles = await getnews.json();
        console.log("success!");
        console.log(articles);
        const container = document.getElementById("news-container");
        container.innerHTML = "";
        for (let article of articles) {
            const card = document.createElement("div");
            card.className = "news-card";
            card.innerHTML = `
        <h3>${article.title}</h3>
        <p>${article.description || "No description available."}</p>
        <p>${article.content || "No content available."}</p>
        <a href="${article.url}" target="_blank">🔗 Read full</a>
        <div class="buttons">
          <button class="summarize-btn">📝 Summarize</button>
          <button class="listen-btn" disabled>🔊 Listen</button>
          <button class="stop-btn" disabled>🔇 Stop</button>
        </div>
        <div class="summary"></div>`;

            const summarizeBtn = card.querySelector(".summarize-btn");
            const listenBtn = card.querySelector(".listen-btn");
            const stopBtn = card.querySelector(".stop-btn");
            const summaryBox = card.querySelector(".summary");
            summarizeBtn.addEventListener("click", async () => {
                summaryBox.innerHTML = " Summarizing... <br>Please wait.";
                const contentToSummarize = article.content || article.description || article.title;
                console.log("Content to summarize:", contentToSummarize);
                console.log("Sending content for summary");
                const summarizeddata = await fetch("/ai",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ content: contentToSummarize })
                    });
                const summaryResult = await summarizeddata.json();
                console.log("Summary result:", summaryResult);
                summaryBox.innerHTML = summaryResult.summary || "No summary available.";


            });
            container.append(card);

        }

    } catch (error) {
        console.error("Error fetching news:", error);
    }
}
fetchNews();
// auto calls for the first time when page loads
async function fetchNews() {
    console.log(" i am from fetchNews function");
    const topic = document.getElementById("topic").value || "general";
    const country = document.getElementById("country").value || "in"
    const lang = document.getElementById("Language").value || "en";
    console.log("Topic:", topic, "Country:", country, "Language:", lang);
    loadnews(topic, country, lang);
}
// calls when user clicks the fetch button
document.getElementById("fetchNews").addEventListener("click", () => {
    const topic = document.getElementById("topic").value || "general";
    const country = document.getElementById("country").value || "in"
    const lang = document.getElementById("Language").value || "en";
    console.log("Topic:", topic, "Country:", country, "Language:", lang);
    loadnews(topic, country, lang);

})




