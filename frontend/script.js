console.log("Script loaded");

const news = document.getElementById("newsContainer");
const modal = document.getElementById("authModal");
const form = document.getElementById("authForm");
const title = document.getElementById("formTitle");
const subtitle = document.getElementById("formSubtitle");
const button = form.querySelector("button");
const toggleText = document.querySelector(".toggle-text");

let isLogin = false; // false = signup, true = login

// Blur background on load
window.addEventListener("load", () => {
  news.classList.add("blur-bg");
  modal.style.display = "flex";
});

// Toggle Login / Signup
function toggleForm() {
  isLogin = !isLogin;

  if (isLogin) {
    title.innerText = "Login";
    subtitle.innerText = "Welcome back! Please login";
    button.innerText = "Login";
    toggleText.innerHTML = `New here? <span onclick="toggleForm()">Create account</span>`;
  } else {
    title.innerText = "Sign Up";
    subtitle.innerText = "Create your account to continue";
    button.innerText = "Sign Up";
    toggleText.innerHTML = `Already have an account? <span onclick="toggleForm()">Login</span>`;
  }
}

// Form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = form.querySelector('input[type="email"]').value.trim();
  const password = form.querySelector('input[type="password"]').value.trim();

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  console.log(isLogin ? "LOGIN" : "SIGNUP", email, password);
    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    const response= await fetch(endpoint, {
        method: "POST",
        headers: {  "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    } );
    const result = await response.json();
    if(response.ok){
        alert(result.message);  
        // Close modal on success
        modal.style.display = "none";
        news.classList.remove("blur-bg");
    }
    else{
        alert(result.message);   
    }   
});


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
                let currentAudio = null;

                listenBtn.addEventListener("click", async () => {
                    if (isSpeaking) return;
                    isSpeaking = true;
                    listenBtn.disabled = true;
                    stopBtn.disabled = false;
                    // CASE 1: Local TTS
                    if (langsarr.includes(langmap[lang])) {
                        const utterance = new SpeechSynthesisUtterance(summaryResult.summary);
                        utterance.lang = langmap[lang];
                        utterance.onend = () => {
                            isSpeaking = false;
                            listenBtn.disabled = false;
                            stopBtn.disabled = true;
                        };
                        speechSynthesis.speak(utterance);
                    }
                    // CASE 2: External TTS
                    try {
                        console.log("Using external TTS service");
                        const res = await fetch("/tts", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                text: summaryResult.summary,
                                voiceid: "JBFqnCBsd6RMkjVDRZzb"
                            })
                        });
                        const audioBlob = await res.blob();
                        const audioUrl = URL.createObjectURL(audioBlob);
                        currentAudio = new Audio(audioUrl);
                        currentAudio.onended = () => {
                            isSpeaking = false;
                            listenBtn.disabled = false;
                            stopBtn.disabled = true;
                            currentAudio = null;
                        };

                        currentAudio.play();

                    } catch (err) {
                        console.error("External TTS failed:", err);
                        isSpeaking = false;
                        listenBtn.disabled = false;
                        stopBtn.disabled = true;
                    }
                });

                stopBtn.addEventListener("click", () => {
                    if (!isSpeaking) return;
                    // Stop local TTS
                    speechSynthesis.cancel();
                    // Stop external TTS
                    if (currentAudio) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0;
                        currentAudio = null;
                    }
                    isSpeaking = false;
                    listenBtn.disabled = false;
                    stopBtn.disabled = true;
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




