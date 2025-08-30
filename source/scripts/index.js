weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
weatherCodes = {0: "clear skies", 1: "mostly clear", 2: "partly cloudy", 3: "overcast", 45:"fog", 48:"depositing rime fog", 51:"light drizzle", 53:"moderate drizzle", 55:"dense drizzle", 56:"light freezing drizzle", 57:"dense freezing drizzle", 61:"light rain", 63:"moderate rain", 65:"heavy rain", 66:"light freezing rain", 67:"heavy freezing rain", 71:"light snowfall", 73:"moderate snowfall", 75:"heavy snowfall", 77:"snow grains", 80:"light showers", 81:"moderate showers", 82:"violent showers", 85:"light snow showers", 86:"heavy snow showers", 95:"thunderstorms", 96:"hailstorms", 99:"heavy hailstorms"}

function padZero(num) {
    num = num.toString().padStart(2, '0')
    return num
}

function getTime(date) {
    return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

function secondsToHHMM(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  // Pad with 0 if single digit
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  
  return `${hh}:${mm}`;
}

async function loadForecast(lat, lon) {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,uv_index_max,daylight_duration,sunshine_duration,weather_code&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weathercode&timezone=auto&forecast_days=1&temperature_unit=fahrenheit`;

    const res = await fetch(url);
    const data = await res.json();

    const container = document.getElementById("forecast");
    container.innerHTML = ""; // clear old forecasts

    const times = data.hourly.time;
    const temp = data.hourly.temperature_2m;
    const rh = data.hourly.relative_humidity_2m;
    const feels = data.hourly.apparent_temperature;
    const precipProb = data.hourly.precipitation_probability;
    const code = data.hourly.weathercode;
    
    const sunrise = data.daily.sunrise;
    const sunset = data.daily.sunset;
    const maxTemp = data.daily.temperature_2m_max;
    const minTemp = data.daily.temperature_2m_min;
    const uv = data.daily.uv_index_max;
    const daylight = secondsToHHMM(data.daily.daylight_duration);
    const sunshine = secondsToHHMM(data.daily.sunshine_duration);
    const dayCode = data.daily.weather_code;

    for (let i = 0; i < times.length; i++) {
        if (!times[i].startsWith(today)) continue; // only today's hours

        const hour = getTime(times[i]);

        // Create forecast div
        const div = document.createElement("div");
        div.className = "forecast-hour";
        div.id = hour;
        div.innerHTML = `
            <h1>${hour}</h1>
            <img src="assets/weather-icons/${code[i]}.png" class="forecast-icon">
            <h3>${weatherCodes[code[i]]}</h3>
            <h2>${temp[i]} / feels ${feels[i]}</h2>
            <h2>RH: ${rh[i]}%</h2>
            <h2>precip: ${precipProb[i]}%</h2>
        `;

        container.appendChild(div);
    }

    document.getElementById("sunriseTime").innerHTML = getTime(sunrise);
    document.getElementById("sunsetTime").innerHTML = getTime(sunset);
    document.getElementById("daylightTime").innerHTML = daylight;
    document.getElementById("sunlightTime").innerHTML = sunshine;

    document.getElementById("maxTemp").innerHTML = maxTemp + "&deg;F"
    document.getElementById("minTemp").innerHTML = minTemp + "&deg;F"
    document.getElementById("dayWeatherCodeImg").src = "assets/weather-icons/" + dayCode + ".png"
    document.getElementById("dayWeatherCodeName").innerHTML = weatherCodes[dayCode];
    document.getElementById("uvLevel").innerHTML = uv;
}

function detectLocationAndLoad() {
    if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        loadForecast(lat, lon);
        },
        err => {
        console.error("Location denied, using fallback (NYC).", err);
        loadForecast(40.7128, -74.0060); // fallback: New York
        }
    );
    } else {
    console.error("Geolocation not supported, using fallback (NYC).");
    loadForecast(40.7128, -74.0060);
    }
}



document.addEventListener("DOMContentLoaded", () => {

    var welcomeText = document.getElementById("welcomeText");
    var dateText = document.getElementById("date");
    var timeText = document.getElementById("time");

    var x = setInterval(function() {
            var now = new Date();

            var hours = now.getHours();
            var minutes = now.getMinutes();
            var weekDay = now.getDay();
            var month = now.getMonth();
            var date = now.getDate();
            var year = now.getFullYear();

            if (hours < 12) {
                welcomeText.innerHTML = "good morning.";
            } else if (hours < 18) {
                welcomeText.innerHTML = "good afternoon.";
            } else {
                welcomeText.innerHTML = "good evening.";
            }

            var ampm = hours >= 12 ? 'PM' : 'AM';
            var twelvehours = hours % 12;
            var twelvehours = twelvehours ? twelvehours : 12;

            timeText.innerHTML = "the time is " + padZero(hours) + ":" + padZero(minutes) + " (" + twelvehours + ":" + padZero(minutes) + " " + ampm + ")";

            dateText.innerHTML = "today is " + weekDays[weekDay] + ", " + months[month] + " " + date + ", " + year;

    }, 1);

    detectLocationAndLoad();
});