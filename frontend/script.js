console.log("Script loaded successfully");
async function fetchNews() {
    console.log(" i am from fetchNews function");
    const topic =document.getElementById("topic").value ||"tech";
    const country =document.getElementById("country").value||"us"
    const lang =document.getElementById("Language").value ||"en";
    console.log("Topic:", topic, "Country:", country, "Language:", lang);
    }
fetchNews();

