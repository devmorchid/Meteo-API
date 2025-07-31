const apiKey = "9e0921143b95d3445eb89aed234ee789"; // 🔑 ضع مفتاحك هنا

document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value.trim();

  if (city === "") {
    alert("Entrez une ville !");
    return;
  }

  // 🔹 Étape 1 : Obtenir les coordonnées (lat/lon)
  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`)
    .then(res => res.json())
    .then(geoData => {
      if (geoData.length === 0) throw new Error("Ville non trouvée !");
      const { lat, lon, name } = geoData[0];
      

      // 🔹 Étape 2 : Afficher la météo actuelle
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`)
        .then(res => res.json())
        .then(data => {
          document.getElementById("cityName").textContent = name;
          document.getElementById("temperature").textContent = data.main.temp.toFixed(1);
          document.getElementById("description").textContent = data.weather[0].description;

          // ✅ 🔄 Changer l'image de fond selon la météo
          const meteo = data.weather[0].main.toLowerCase(); // exemple : "clear", "clouds", "rain", etc.
          let imageUrl = "img/default.avif";

          if (meteo.includes("clear")) {
            imageUrl = "img/clear.avif";
          } else if (meteo.includes("cloud")) {
            imageUrl = "img/cloud.avif";
          } else if (meteo.includes("rain")) {
            imageUrl = "img/rain.avif";
          } else if (meteo.includes("snow")) {
            imageUrl = "img/sunny.jpg";
          }

          document.body.style.backgroundImage = `url('${imageUrl}')`;
          document.body.style.backgroundSize = "cover";
          document.body.style.backgroundPosition = "center";
        });

      // 🔹 Étape 3 : Prévisions sur 5 jours (une par jour)
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
          const forecastCards = document.getElementById("forecastCards");
          forecastCards.innerHTML = "";

          const joursAjoutes = new Set();

          data.list.forEach(entry => {
            const date = new Date(entry.dt * 1000);
            const dateStr = date.toDateString(); // Unique par jour

            if (!joursAjoutes.has(dateStr)) {
              const jour = date.toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "short"
              });

              const icon = entry.weather[0].icon;
              const description = entry.weather[0].description;
              const temp = entry.main.temp.toFixed(1);

              const card = document.createElement("div");
              card.className = "weather-card";
              card.innerHTML = `
                <h4>${jour}</h4>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
                <p>${temp} °C</p>
                <small>${description}</small>
              `;

              forecastCards.appendChild(card);
              joursAjoutes.add(dateStr);
            }
          });

          if (forecastCards.children.length === 0) {
            forecastCards.innerHTML = "<p>Aucune prévision trouvée.</p>";
          }
        });
    })
    .catch(error => {
      alert("Erreur : " + error.message);
    });
});
