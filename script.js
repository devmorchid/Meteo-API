const apiKey = "9e0921143b95d3445eb89aed234ee789";

let isFahrenheit = false;
let forecastData = [];
let currentTempC = null;

window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getCurrentWeather(lat, lon, "Votre position");
      getForecastData(lat, lon);
    }, () => {
      alert("Impossible d'accéder à votre position.");
    });
  } else {
    alert("La géolocalisation n'est pas prise en charge par ce navigateur.");
  }
});

document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value.trim();
  if (city === "") return alert("Entrez une ville !");
  searchCityWeather(city);
});

function searchCityWeather(city) {
  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`)
    .then(res => res.json())
    .then(geoData => {
      if (geoData.length === 0) throw new Error("Ville non trouvée !");
      const { lat, lon, name } = geoData[0];
      getCurrentWeather(lat, lon, name);
      getForecastData(lat, lon);
    })
    .catch(error => alert("Erreur : " + error.message));
}

function getCurrentWeather(lat, lon, cityName) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`)
    .then(res => res.json())
    .then(data => {
      currentTempC = data.main.temp;
      const iconCode = data.weather[0].icon;
      const description = data.weather[0].description;

      document.getElementById("cityName").textContent = cityName;
      document.getElementById("description").textContent = description;
      document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

      updateCurrentTemp();

      const meteo = data.weather[0].main.toLowerCase();
      let imageUrl = "img/default.avif";
      if (meteo.includes("clear")) imageUrl = "img/clear.avif";
      else if (meteo.includes("cloud")) imageUrl = "img/cloud.avif";
      else if (meteo.includes("rain")) imageUrl = "img/rain.avif";
      else if (meteo.includes("snow")) imageUrl = "img/sunny.jpg";

      document.body.style.backgroundImage = `url('${imageUrl}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    });
}

function getForecastData(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      forecastData = data.list;
      updateForecastCards();
      updateForecast3h();
    });
}

function updateCurrentTemp() {
  const temp = isFahrenheit ? (currentTempC * 9) / 5 + 32 : currentTempC;
  const unit = isFahrenheit ? "°F" : "°C";
  document.getElementById("temperature").textContent = temp.toFixed(1) + " " + unit;
}

function updateForecastCards() {
  const forecastCards = document.getElementById("forecastCards");
  forecastCards.innerHTML = "";

  const joursAjoutes = new Set();

  forecastData.forEach(entry => {
    const date = new Date(entry.dt * 1000);
    const dateStr = date.toDateString();

    if (!joursAjoutes.has(dateStr)) {
      const jour = date.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short"
      });

      const icon = entry.weather[0].icon;
      const description = entry.weather[0].description;
      let temp = entry.main.temp;
      temp = isFahrenheit ? (temp * 9) / 5 + 32 : temp;

      const card = document.createElement("div");
      card.className = "weather-card";
      card.innerHTML = `
        <h4>${jour}</h4>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p>${temp.toFixed(1)} ${isFahrenheit ? "°F" : "°C"}</p>
        <small>${description}</small>
      `;

      forecastCards.appendChild(card);
      joursAjoutes.add(dateStr);
    }
  });
}

function updateForecast3h() {
  const forecast3h = document.getElementById("forecast3h");
  forecast3h.innerHTML = "";

  forecastData.slice(0, 6).forEach(entry => {
    const heure = new Date(entry.dt * 1000).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const icon = entry.weather[0].icon;
    const description = entry.weather[0].description;
    let temp = entry.main.temp;
    temp = isFahrenheit ? (temp * 9) / 5 + 32 : temp;

    const card = document.createElement("div");
    card.className = "hour-card";
    card.innerHTML = `
      <strong>${heure}</strong>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
      <p>${temp.toFixed(1)} ${isFahrenheit ? "°F" : "°C"}</p>
      <small>${description}</small>
    `;
    forecast3h.appendChild(card);
  });
}

document.getElementById("toggleMode").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

document.getElementById("unitSwitch").addEventListener("change", function () {
  isFahrenheit = this.checked;
  updateCurrentTemp();
  updateForecastCards();
  updateForecast3h();
});
