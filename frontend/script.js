console.log("Script loaded");
const news = document.getElementById("newsContainer");
const modal = document.getElementById("authModal");
const form = document.getElementById("authForm");
const title = document.getElementById("formTitle");
const subtitle = document.getElementById("formSubtitle");
const button = form.querySelector("button");
const btn = form.querySelector(".submit-btn");
const toggleText = document.querySelector(".toggle-text");
let currentStep = "form"; // "form" | "otp"
let tempEmail = "";
let tempPassword = "";
let isLogin = false;

// false = signup, true = login

// Blur background on load
window.addEventListener("load", () => {
    news.classList.add("blur-bg");
    modal.style.display = "flex";
});

const passwordInput = form.querySelector('input[type="password"]');
const ruleLength = document.getElementById("rule-length");
const ruleUpper = document.getElementById("rule-uppercase");
const ruleNumber = document.getElementById("rule-number");

passwordInput.addEventListener("input", () => {
    if (isLogin) return;
    const str = passwordInput.value;

    const isLengthValid = str.length >= 8;
    const hasUppercase = /[A-Z]/.test(str);
    const hasNumber = /[0-9]/.test(str);

    // Length UI
    if (isLengthValid) {
        ruleLength.textContent = "✔ At least 8 characters";
        ruleLength.classList.add("valid");
    } else {
        ruleLength.textContent = "❌ At least 8 characters";
        ruleLength.classList.remove("valid");
    }

    // Uppercase UI
    if (hasUppercase) {
        ruleUpper.textContent = "✔ One uppercase letter";
        ruleUpper.classList.add("valid");
    } else {
        ruleUpper.textContent = "❌ One uppercase letter";
        ruleUpper.classList.remove("valid");
    }

    // Number UI
    if (hasNumber) {
        ruleNumber.textContent = "✔ One number";
        ruleNumber.classList.add("valid");
    } else {
        ruleNumber.textContent = "❌ One number";
        ruleNumber.classList.remove("valid");
    }
});

function forgotPassword() {
    // hide normal auth form
    document.getElementById("authForm").style.display = "none";
    document.getElementById("otpSection").style.display = "none";

    // show forgot password section
    document.getElementById("forgotSection").style.display = "block";

    // update title
    document.getElementById("formTitle").innerText = "Reset Password";
    document.getElementById("formSubtitle").innerText = "Enter your email to continue";
}
let temp = null;
let isOtpVerified = false;
// otp verfication
document.getElementById("verifyOtp").addEventListener("click", async () => {
    const otp = document.getElementById("otpInput").value.trim();

    if (!otp) {
        alert("Enter OTP");
        return;
    }

    // verify OTP
    const otp_response = await fetch("/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: tempEmail, otp })
    });

    const otp_result = await otp_response.json();

    if (!otp_response.ok) {
        alert(otp_result.message || "OTP verification failed");
        return;
    }

    // OTP SUCCESS → NOW SIGNUP
    const response = await fetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: tempEmail, password: tempPassword })
    });

    const result = await response.json();

    if (response.ok) {
        alert(result.message);
        modal.style.display = "none";
        news.classList.remove("blur-bg");

        currentStep = "form"; // reset
    } else {
        alert(result.message);
    }
    currentStep = "form";
});

// forgot password


// Generate OTP
document.querySelector(".reset-password").addEventListener("click", async () => {
    const email = document.getElementById("resetEmail").value.trim();
    temp = email;

    if (!email) {
        alert("Enter email");
        return;
    }

    const gen_otp = await fetch("/otp/gen_forgetpw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    const gen_result = await gen_otp.json();

    if (!gen_otp.ok) {
        alert(gen_result.message || "Failed to send OTP");
        return;
    }

    alert("OTP sent!");
    document.getElementById("fp-email").style.display = "none";
    document.getElementById("fp-otp").style.display = "block";
});


// Verify OTP
document.querySelector(".verify_otp").addEventListener("click", async () => {
    if (!temp) {
        alert("Please enter email and generate OTP first");
        return;
    }

    const otp = document.getElementById("resetOtp").value.trim();

    if (!otp) {
        alert("Enter OTP");
        return;
    }

    const otp_response = await fetch("/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: temp, otp })
    });

    const otp_result = await otp_response.json();

    if (!otp_response.ok) {
        alert(otp_result.message || "OTP verification failed");
        return;
    }

    isOtpVerified = true;
    alert("OTP verified!");
    document.getElementById("fp-otp").style.display = "none";
    document.getElementById("fp-password").style.display = "block";
});


// Reset Password
document.querySelector(".reset_password").addEventListener("click", async () => {
    if (!isOtpVerified) {
        alert("Verify OTP first");
        return;
    }

    const newPassword = document.getElementById("newPassword").value.trim();

    if (!newPassword) {
        alert("Please enter new password");
        return;
    }

    const isLengthValid = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!isLengthValid || !hasUppercase || !hasNumber) {
        alert("Password must be 8+ chars, include uppercase & number");
        return;
    }

    const response = await fetch("/auth/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: temp, newPassword })
    });

    const result = await response.json();

    if (!response.ok) {
        alert(result.message || "Reset failed");
        return;
    }

    alert("Password reset successful!");
    window.location.href = "http://localhost:5000/";
});
// Toggle Login / Signup
function toggleForm() {
    isLogin = !isLogin;
    document.getElementById("forgotSection").style.display = "none";
    document.getElementById("fp-email").style.display = "block";
    document.getElementById("fp-otp").style.display = "none";
    document.getElementById("fp-password").style.display = "none";
    document.getElementById("authForm").style.display = "block";
    if (isLogin) {
        title.innerText = "Login";
        subtitle.innerText = "Welcome back! Please login";
        button.innerText = "Login";
        toggleText.innerHTML = `New here? <span onclick="toggleForm()">Create account</span>`;
        passwordRules.style.display = "none";
        document.getElementById("forgotPassword").style.display = "block";
        document.getElementById("otpSection").style.display = "none";
    } else {
        title.innerText = "Sign Up";
        subtitle.innerText = "Create your account to continue";
        button.innerText = "Sign Up";
        toggleText.innerHTML = `Already have an account? <span onclick="toggleForm()">Login</span>`;
        passwordRules.style.display = "block";
    }
}

// Form submit
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value.trim();

    // VALIDATION
    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    // DISABLE BUTTON AFTER VALIDATION
    btn.disabled = true;
    btn.innerText = isLogin ? "Logging in..." : "Sending OTP...";

    try {

        // ================= LOGIN FLOW =================
        if (isLogin) {
            const response = await fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                modal.style.display = "none";
                news.classList.remove("blur-bg");

                // optional safety reset
                btn.disabled = false;
                btn.innerText = "Login";
            } else {
                btn.disabled = false;
                btn.innerText = "Login";
                alert(result.message);
            }

            return;
        }

        // ================= SIGNUP FLOW =================

        if (currentStep === "form") {

            const isLengthValid = password.length >= 8;
            const hasUppercase = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);

            if (!isLengthValid || !hasUppercase || !hasNumber) {
                alert("Password does not meet requirements");
                btn.disabled = false;
                btn.innerText = "Sign Up";
                return;
            }

            // store temporarily
            tempEmail = email;
            tempPassword = password;

            const response = await fetch("/otp/gen", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Failed to send OTP");
                btn.disabled = false;
                btn.innerText = "Sign Up";
                return;
            }

            console.log("OTP generated and sent to email");

            // SHOW OTP UI
            document.getElementById("otpSection").style.display = "block";

            // KEEP BUTTON DISABLED AFTER OTP (important)
            btn.innerText = "OTP Sent";

            currentStep = "otp";
            return;
        }

    } catch (err) {
        console.error(err);
        alert("Something went wrong");

        // ALWAYS RE-ENABLE ON ERROR
        btn.disabled = false;
        btn.innerText = isLogin ? "Login" : "Sign Up";
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




