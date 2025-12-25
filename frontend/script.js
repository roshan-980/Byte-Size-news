console.log("Script loaded successfully");
let voices = [];
let langsarr = [];
function loadVoices() {
    voices = speechSynthesis.getVoices();
    console.log("Available voices:", voices);

    voices.forEach((voice, index) => {
        console.log(
            index,
            voice.name,
            voice.lang,
            voice.localService ? "Local" : "Remote"
        );
    });
    voices.forEach(voice => {
        langsarr.push(voice.lang);
    });
    console.log(langsarr);

}
// Chrome fires this when voices are ready
speechSynthesis.onvoiceschanged = loadVoices;

// i am in tts/feature branch 
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
        // doing lang check here !
        let langmap = {
            "en": "en-IN",
            "hi": "hi-IN",
            "mr": "mr-IN",
            "pa": "pa-IN",
        }
        console.log("the langmap ", langmap[lang]);
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
            // Summary feature
            summarizeBtn.addEventListener("click", async () => {
                speechSynthesis.cancel();
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
                //write code for listen and stop button    
                let isSpeaking = false;
                listenBtn.disabled = false;
                stopBtn.disabled = true;

                listenBtn.addEventListener("click", () => {
                    if (isSpeaking) return;
                    if (langsarr.includes(langmap[lang])) {
                        isSpeaking = true;
                        listenBtn.disabled = true;
                        stopBtn.disabled = false;
                        const utterance = new SpeechSynthesisUtterance(summaryResult.summary);
                        utterance.lang = langmap[lang];
                        speechSynthesis.speak(utterance);
                    }
                    else {
                        console.log("Selected language voice not available. Using default voice.");
                    }
                });

                stopBtn.addEventListener("click", () => {
                    if (!isSpeaking) return;
                    isSpeaking = false;
                    listenBtn.disabled = false;
                    stopBtn.disabled = true;
                    speechSynthesis.cancel();
                });

            });
            container.append(card);

        }

    } catch (error) {
        console.error("Error fetching news:", error);
    }
}
// auto calls for the first time when page loads
async function fetchNews() {
    console.log(" i am from fetchNews function");
    speechSynthesis.cancel();
    const topic = document.getElementById("topic").value || "general";
    const country = document.getElementById("country").value || "in"
    const lang = document.getElementById("Language").value || "en";
    console.log("Topic:", topic, "Country:", country, "Language:", lang);
    loadnews(topic, country, lang);
}
// calls when user clicks the fetch button
document.getElementById("fetchNews").addEventListener("click", () => {
    speechSynthesis.cancel();
    const topic = document.getElementById("topic").value || "general";
    const country = document.getElementById("country").value || "in"
    const lang = document.getElementById("Language").value || "en";
    console.log("Topic:", topic, "Country:", country, "Language:", lang);
    loadnews(topic, country, lang);

})
fetchNews();




