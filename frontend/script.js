console.log("Script loaded successfully");
async function loadnews(topic,country,lang){
    console.log(" i am from loadnews function");
    console.log("Topic:", topic, "Country:", country, "Language:", lang);
    try{
        const getnews=await fetch(`/news?topic=${topic}&country=${country}&lang=${lang}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        const newsdata=await getnews.json();
        console.log("success!");
        console.log(newsdata);
    }catch(error){
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
    loadnews(topic,country,lang);
}
// calls when user clicks the fetch button
document.getElementById("fetchNews").addEventListener("click", () => {
    const topic = document.getElementById("topic").value || "general";
    const country = document.getElementById("country").value || "in"
    const lang = document.getElementById("Language").value || "en";
    console.log("Topic:", topic, "Country:", country, "Language:", lang);
    loadnews(topic,country,lang);

})




