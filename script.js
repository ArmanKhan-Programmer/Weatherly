const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("city");
const submitBtn = document.getElementById("submitBtn");
const cityName = document.getElementById("cityName");
const locationMeta = document.getElementById("locationMeta");
const statusBox = document.getElementById("status");
const loading = document.getElementById("loading");
const citiesGrid = document.getElementById("citiesGrid");
const hourlyForecast = document.getElementById("hourlyForecast");
const dailyForecast = document.getElementById("dailyForecast");
const refreshBtn = document.getElementById("refreshBtn");
const googleWeatherBtn = document.getElementById("googleWeatherBtn");

const commonCities = [
  "Agra, India", "Delhi, India", "Mumbai, India", "Lucknow, India",
  "Kolkata, India", "Bengaluru, India"
];

const cache = new Map();
let activePlace = null;
let activeWeather = null;
let unitSystem = localStorage.getItem("weatherly-units") || "celsius";
let clockTimer = null;

const $ = (id) => document.getElementById(id);

const WEATHER_META = {
  0: { label: "Clear sky", icon: "fa-sun", scene: "clear" },
  1: { label: "Mainly clear", icon: "fa-sun", scene: "clear" },
  2: { label: "Partly cloudy", icon: "fa-cloud-sun", scene: "partly" },
  3: { label: "Overcast", icon: "fa-cloud", scene: "cloudy" },
  45: { label: "Fog", icon: "fa-smog", scene: "fog" },
  48: { label: "Rime fog", icon: "fa-smog", scene: "fog" },
  51: { label: "Light drizzle", icon: "fa-cloud-rain", scene: "rain" },
  53: { label: "Moderate drizzle", icon: "fa-cloud-rain", scene: "rain" },
  55: { label: "Dense drizzle", icon: "fa-cloud-rain", scene: "rain" },
  56: { label: "Light freezing drizzle", icon: "fa-cloud-rain", scene: "rain" },
  57: { label: "Dense freezing drizzle", icon: "fa-cloud-rain", scene: "rain" },
  61: { label: "Slight rain", icon: "fa-cloud-rain", scene: "rain" },
  63: { label: "Moderate rain", icon: "fa-cloud-showers-heavy", scene: "rain" },
  65: { label: "Heavy rain", icon: "fa-cloud-showers-heavy", scene: "rain" },
  66: { label: "Light freezing rain", icon: "fa-cloud-rain", scene: "rain" },
  67: { label: "Heavy freezing rain", icon: "fa-cloud-showers-heavy", scene: "rain" },
  71: { label: "Light snow", icon: "fa-snowflake", scene: "snow" },
  73: { label: "Moderate snow", icon: "fa-snowflake", scene: "snow" },
  75: { label: "Heavy snow", icon: "fa-snowflake", scene: "snow" },
  77: { label: "Snow grains", icon: "fa-snowflake", scene: "snow" },
  80: { label: "Light rain showers", icon: "fa-cloud-rain", scene: "rain" },
  81: { label: "Moderate rain showers", icon: "fa-cloud-showers-heavy", scene: "rain" },
  82: { label: "Heavy rain showers", icon: "fa-cloud-showers-heavy", scene: "rain" },
  85: { label: "Light snow showers", icon: "fa-snowflake", scene: "snow" },
  86: { label: "Heavy snow showers", icon: "fa-snowflake", scene: "snow" },
  95: { label: "Thunderstorm", icon: "fa-cloud-bolt", scene: "storm" },
  96: { label: "Thunderstorm + hail", icon: "fa-cloud-bolt", scene: "storm" },
  99: { label: "Severe thunderstorm", icon: "fa-cloud-bolt", scene: "storm" }
};

function showStatus(message, type = "danger") {
  statusBox.className = `alert alert-${type}`;
  statusBox.innerHTML = `<i class="fa-solid ${type === "danger" ? "fa-circle-exclamation" : "fa-circle-info"} me-2"></i>${escapeHtml(message)}`;
}

function hideStatus() {
  statusBox.className = "alert d-none";
  statusBox.textContent = "";
}

function setLoading(active) {
  loading.classList.toggle("d-none", !active);
  submitBtn.disabled = active;
  submitBtn.innerHTML = active
    ? '<i class="fa-solid fa-spinner fa-spin"></i><span>Loading...</span>'
    : '<i class="fa-solid fa-magnifying-glass"></i><span>Search</span>';
}

function number(value, digits = 1) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(digits) : "--";
}

function roundNumber(value, digits = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 10 ** digits) / 10 ** digits : null;
}

function toFahrenheit(celsius) {
  const n = Number(celsius);
  return Number.isFinite(n) ? (n * 9 / 5) + 32 : null;
}

function formatTemp(celsius, digits = 0) {
  const raw = unitSystem === "celsius" ? Number(celsius) : toFahrenheit(celsius);
  return Number.isFinite(raw) ? `${raw.toFixed(digits)}°` : "--";
}

function formatTempValue(celsius, digits = 1) {
  const raw = unitSystem === "celsius" ? Number(celsius) : toFahrenheit(celsius);
  return Number.isFinite(raw) ? raw.toFixed(digits) : "--";
}

function formatSpeed(kmh, digits = 0) {
  const n = Number(kmh);
  if (!Number.isFinite(n)) return "--";
  if (unitSystem === "celsius") return `${n.toFixed(digits)} km/h`;
  return `${(n * 0.621371).toFixed(digits)} mph`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(text) {
  return String(text).toLowerCase().trim().replace(/\s+/g, " ");
}

function parseLocationInput(input) {
  const parts = input.split(",").map((part) => part.trim()).filter(Boolean);
  return {
    name: parts[0] || input.trim(),
    qualifier: parts.slice(1).join(", ")
  };
}

function directionName(degrees) {
  const deg = Number(degrees);
  if (!Number.isFinite(deg)) return "--";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return `${dirs[Math.round(deg / 45) % 8]} (${Math.round(deg)}°)`;
}

function formatLocalApiTime(value) {
  if (!value || typeof value !== "string") return "--";
  const match = value.match(/T(\d{2}):(\d{2})/);
  if (!match) return "--";
  let hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
}

function formatHourLabel(value) {
  if (!value || typeof value !== "string") return "--";
  const match = value.match(/T(\d{2}):/);
  if (!match) return "--";
  let hour = Number(match[1]);
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour} ${suffix}`;
}

function formatLocalDate(value, options = {}) {
  const [year, month, day] = String(value).split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return "--";
  // Use UTC for a date-only API value so the weekday cannot shift because the
  // visitor's computer is in a different timezone from the selected city.
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
    ...options
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatLocalApiDateTime(value) {
  if (!value || typeof value !== "string") return "";
  const [date, time] = value.split("T");
  if (!date || !time) return "";
  return `${date} ${time.slice(0, 5)}`;
}

function weatherDescription(code) {
  return WEATHER_META[Number(code)]?.label || "Unknown conditions";
}

function weatherMeta(code) {
  return WEATHER_META[Number(code)] || { label: "Unknown conditions", icon: "fa-cloud", scene: "cloudy" };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error(`Service error (${response.status})`);
  return response.json();
}

function chooseBestPlace(results, requestedName) {
  const wanted = normalize(requestedName);
  return [...results].sort((a, b) => {
    const aExact = normalize(a.name) === wanted ? 1 : 0;
    const bExact = normalize(b.name) === wanted ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;

    const aCity = /PPL|PPLA|PPLC/.test(a.feature_code || "") ? 1 : 0;
    const bCity = /PPL|PPLA|PPLC/.test(b.feature_code || "") ? 1 : 0;
    if (aCity !== bCity) return bCity - aCity;

    return Number(b.population || 0) - Number(a.population || 0);
  })[0];
}

async function geocodeCity(input) {
  const cleaned = input.trim();
  if (!cleaned) throw new Error("Please enter a city name.");

  const cacheKey = `geo:${normalize(cleaned)}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const { name, qualifier } = parseLocationInput(cleaned);
  const params = new URLSearchParams({
    name: cleaned,
    count: "10",
    language: "en",
    format: "json"
  });

  const upperQualifier = qualifier.toUpperCase();
  if (upperQualifier === "IN" || normalize(qualifier) === "india") {
    params.set("name", name);
    params.set("countryCode", "IN");
  }

  const data = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`);
  if (!Array.isArray(data.results) || data.results.length === 0) {
    throw new Error(`Location "${cleaned}" was not found. Try "City, Country".`);
  }

  const place = chooseBestPlace(data.results, name);
  cache.set(cacheKey, place);
  return place;
}

async function fetchWeather(place) {
  // Weather must never be cached indefinitely. A previous version of the app
  // stored the response forever, which could make the dashboard show stale
  // temperatures even after a new search.
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
      "visibility",
      "precipitation",
      "weather_code",
      "is_day"
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "wind_speed_10m"
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_min",
      "temperature_2m_max",
      "apparent_temperature_max",
      "precipitation_probability_max",
      "precipitation_sum",
      "sunrise",
      "sunset"
    ].join(","),
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    timezone: "auto",
    forecast_days: "7",
    // Ask the service for the latest available forecast run.
    past_days: "0"
  });

  return fetchJson(`https://api.open-meteo.com/v1/forecast?${params.toString()}&_=${Date.now()}`);
}

async function fetchCityPhoto(place) {
  const cacheKey = `photo:${place.latitude},${place.longitude}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const params = new URLSearchParams({
    action: "query",
    generator: "geosearch",
    ggscoord: `${place.latitude}|${place.longitude}`,
    ggsradius: "10000",
    ggslimit: "12",
    prop: "coordinates|pageimages|info",
    inprop: "url",
    piprop: "thumbnail|name",
    pithumbsize: "1200",
    pilicense: "free",
    formatversion: "2",
    format: "json",
    origin: "*"
  });

  try {
    const data = await fetchJson(`https://en.wikipedia.org/w/api.php?${params.toString()}`);
    const pages = Array.isArray(data?.query?.pages) ? data.query.pages : [];
    const withImage = pages.find((page) => page.thumbnail?.source);
    if (withImage) {
      const result = {
        url: withImage.thumbnail.source,
        title: withImage.title,
        pageUrl: withImage.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(withImage.title)}`
      };
      cache.set(cacheKey, result);
      return result;
    }
  } catch {
    // fall through to the title search.
  }

  try {
    const searchParams = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `${place.name} ${place.country || ""}`,
      gsrlimit: "5",
      prop: "pageimages|info",
      inprop: "url",
      piprop: "thumbnail|name",
      pithumbsize: "1200",
      pilicense: "free",
      formatversion: "2",
      format: "json",
      origin: "*"
    });
    const data = await fetchJson(`https://en.wikipedia.org/w/api.php?${searchParams.toString()}`);
    const pages = Array.isArray(data?.query?.pages) ? data.query.pages : [];
    const withImage = pages.find((page) => page.thumbnail?.source);
    if (withImage) {
      const result = {
        url: withImage.thumbnail.source,
        title: withImage.title,
        pageUrl: withImage.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(withImage.title)}`
      };
      cache.set(cacheKey, result);
      return result;
    }
  } catch {
    // No photo is still a valid state.
  }

  return null;
}

function updateUnitUi() {
  const metric = unitSystem === "celsius";
  $("unitLabel").textContent = metric ? "°C" : "°F";
  document.documentElement.dataset.units = metric ? "metric" : "imperial";
}

function renderCityPhoto(photo) {
  const backdrop = $("cityBackdrop");
  const credit = $("photoCredit");

  if (!photo?.url) {
    backdrop.style.backgroundImage = "";
    backdrop.classList.remove("has-photo");
    credit.innerHTML = '<i class="fa-regular fa-image"></i> City photo unavailable';
    return;
  }

  backdrop.style.backgroundImage = `url("${photo.url.replaceAll('"', '\\"')}")`;
  backdrop.classList.add("has-photo");
  credit.innerHTML = `<i class="fa-regular fa-image"></i> <a href="${escapeHtml(photo.pageUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(photo.title)}</a>`;
}

function renderScene(current, daily, place, data) {
  const meta = weatherMeta(current.weather_code);
  const isDay = Number(current.is_day) === 1;

  const scene = $("currentScene");
  scene.className = `current-scene weather-mode-${meta.scene} ${isDay ? "is-day" : "is-night"}`;

  $("weatherSymbol").innerHTML = `<i class="fa-solid ${meta.icon}"></i>`;
  $("condition").textContent = meta.label;

  const feels = formatTempValue(current.apparent_temperature, 1);
  const rain = Number(activeWeather?.hourly?.precipitation_probability?.[activeWeather?.hourly?.time?.findIndex((time) => time === current.time)] ?? 0);

  let narrative = `Feels like ${feels}° ${unitSystem === "celsius" ? "C" : "F"} in ${place.name}.`;
  if (rain >= 60) narrative = `Carry an umbrella — rain is fairly likely around ${place.name}.`;
  else if (meta.scene === "clear" && isDay) narrative = `Bright skies are in charge across ${place.name}.`;
  else if (!isDay && meta.scene === "clear") narrative = `A clear night is settling over ${place.name}.`;
  else if (meta.scene === "storm") narrative = `Stormy conditions are being reported for ${place.name}.`;
  else if (meta.scene === "snow") narrative = `Snowy conditions are shaping the weather picture in ${place.name}.`;

  $("weatherNarrative").textContent = narrative;
  $("rainChance").textContent = `${Number.isFinite(rain) ? Math.round(rain) : "--"}%`;
  $("visibility").textContent = Number.isFinite(Number(current.visibility))
    ? `${(Number(current.visibility) / 1000).toFixed(1)} km`
    : "--";

  $("sunrise").textContent = formatLocalApiTime(daily.sunrise?.[0]);
  $("sunset").textContent = formatLocalApiTime(daily.sunset?.[0]);
}

function renderRange(daily) {
  const min = Number(daily.temperature_2m_min?.[0]);
  const max = Number(daily.temperature_2m_max?.[0]);

  $("minTemp").textContent = formatTempValue(min);
  $("maxTemp").textContent = formatTempValue(max);

  const span = max - min;
  $("rangeFill").style.width = Number.isFinite(span) && span > 0 ? `${Math.min(100, Math.max(18, 30 + span * 3))}%` : "42%";
}

function renderMainWeather(place, data) {
  const current = data.current || {};
  const daily = data.daily || {};

  activePlace = place;
  activeWeather = data;

  cityName.textContent = place.name;
  const location = [place.admin1, place.country].filter(Boolean).join(", ");
  locationMeta.innerHTML = `<i class="fa-solid fa-location-dot"></i>${escapeHtml(location || "Selected location")} <span class="dot-separator">•</span> ${escapeHtml(data.timezone || place.timezone || "Local time")}`;

  $("temp").textContent = formatTempValue(current.temperature_2m);
  const tempUnitSup = document.querySelector(".scene-temperature sup");
  if (tempUnitSup) tempUnitSup.textContent = `°${unitSystem === "celsius" ? "C" : "F"}`;

  $("feelsLike").textContent = formatTempValue(current.apparent_temperature);
  $("humidity").textContent = number(current.relative_humidity_2m, 0);
  $("cloudCover").textContent = number(current.cloud_cover, 0);
  $("cloudCover2").textContent = number(current.cloud_cover, 0);
  $("windSpeed").textContent = unitSystem === "celsius"
    ? number(current.wind_speed_10m, 1)
    : (Number(current.wind_speed_10m) * 0.621371).toFixed(1);
  document.querySelectorAll(".unit-speed").forEach((el) => {
    el.textContent = unitSystem === "celsius" ? "km/h" : "mph";
  });
  $("windDirection").textContent = directionName(current.wind_direction_10m);

  const updated = formatLocalApiDateTime(current.time);
  $("updatedAt").textContent = updated
    ? `API time ${updated.replace("T", " ")} • ${data.timezone || "local time"}`
    : "Latest API response loaded";

  $("hourlyTimezone").textContent = data.timezone || "Local time";

  renderScene(current, daily, place, data);
  renderRange(daily);
  startClock(data.timezone);
}

function getFutureHourIndexes(hourly, count = 12) {
  const times = hourly?.time || [];
  const currentTime = activeWeather?.current?.time || "";
  let start = times.findIndex((t) => t >= currentTime);
  if (start < 0) start = 0;
  return Array.from({ length: count }, (_, i) => start + i)
    .filter((index) => index < times.length);
}

function renderHourly(data) {
  const hourly = data.hourly || {};
  const indexes = getFutureHourIndexes(hourly, 12);

  hourlyForecast.innerHTML = indexes.map((index) => {
    const code = hourly.weather_code?.[index];
    const meta = weatherMeta(code);
    const day = new Date((hourly.time?.[index] || "").replace("T", " "));
    const rain = Number(hourly.precipitation_probability?.[index] ?? 0);

    return `
      <article class="hour-card">
        <span class="hour-time">${escapeHtml(formatHourLabel(hourly.time?.[index]))}</span>
        <span class="hour-icon"><i class="fa-solid ${meta.icon}"></i></span>
        <strong class="hour-temp">${escapeHtml(formatTemp(hourly.temperature_2m?.[index], 0))}</strong>
        <span class="hour-condition">${escapeHtml(meta.label)}</span>
        <span class="hour-rain"><i class="fa-solid fa-droplet"></i> ${Math.round(rain)}%</span>
      </article>
    `;
  }).join("");

  if (!indexes.length) hourlyForecast.innerHTML = '<div class="empty-state">Hourly forecast unavailable.</div>';
}

function renderDaily(data) {
  const daily = data.daily || {};
  const dates = daily.time || [];

  dailyForecast.innerHTML = dates.map((date, index) => {
    const meta = weatherMeta(daily.weather_code?.[index]);
    const rain = Number(daily.precipitation_probability_max?.[index] ?? 0);
    const precip = Number(daily.precipitation_sum?.[index] ?? 0);
    const label = index === 0 ? "Today" : formatLocalDate(date);

    return `
      <article class="day-card ${index === 0 ? "is-today" : ""}">
        <div class="day-top">
          <div>
            <span class="day-name">${escapeHtml(label)}</span>
            <span class="day-date">${escapeHtml(date)}</span>
          </div>
          <span class="day-icon"><i class="fa-solid ${meta.icon}"></i></span>
        </div>
        <div class="day-condition">${escapeHtml(meta.label)}</div>
        <div class="day-temps">
          <strong>${escapeHtml(formatTemp(daily.temperature_2m_max?.[index], 0))}</strong>
          <span>${escapeHtml(formatTemp(daily.temperature_2m_min?.[index], 0))}</span>
        </div>
        <div class="day-rain"><span><i class="fa-solid fa-umbrella"></i> ${Math.round(rain)}% rain</span><span>${precip.toFixed(1)} mm</span></div>
      </article>
    `;
  }).join("");
}

function renderCityCards(items) {
  citiesGrid.innerHTML = items.map(({ city, place, weather, photo }) => {
    const current = weather?.current || {};
    const meta = weatherMeta(current.weather_code);

    return `
      <button class="city-card" type="button" data-city="${escapeHtml(city)}">
        <div class="city-photo" ${photo?.url ? `style="background-image:url('${photo.url.replaceAll("'", "\\'")}')"` : ""}>
          <span class="city-photo-overlay"></span>
          <span class="city-card-badge"><i class="fa-solid ${meta.icon}"></i> ${escapeHtml(meta.label)}</span>
        </div>
        <div class="city-card-body">
          <div>
            <h3>${escapeHtml(place.name)}</h3>
            <p>${escapeHtml([place.admin1, place.country].filter(Boolean).join(", "))}</p>
          </div>
          <div class="city-card-temp">${escapeHtml(formatTempValue(current.temperature_2m, 0))}°</div>
        </div>
      </button>
    `;
  }).join("");

  document.querySelectorAll(".city-card").forEach((button) => {
    button.addEventListener("click", async () => {
      cityInput.value = button.dataset.city;
      await refreshDashboard(button.dataset.city);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

async function renderCommonCities() {
  const items = await Promise.all(commonCities.map(async (city) => {
    try {
      const place = await geocodeCity(city);
      const [weather, photo] = await Promise.all([fetchWeather(place), fetchCityPhoto(place)]);
      return { city, place, weather, photo };
    } catch {
      return null;
    }
  }));

  renderCityCards(items.filter(Boolean));
}

function startClock(timezone = activeWeather?.timezone) {
  clearInterval(clockTimer);

  const tick = () => {
    try {
      const now = new Date();
      const formatted = timezone
        ? new Intl.DateTimeFormat("en-IN", {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
          }).format(now)
        : now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      $("localClock").innerHTML = `<i class="fa-regular fa-clock"></i> ${escapeHtml(formatted)}`;
    } catch {
      $("localClock").textContent = "--:--";
    }
  };

  tick();
  clockTimer = setInterval(tick, 1000);
}

async function refreshDashboard(query) {
  if (!query?.trim()) throw new Error("Please enter a city name.");

  hideStatus();
  setLoading(true);

  try {
    const place = await geocodeCity(query);
    const [weather, photo] = await Promise.all([fetchWeather(place), fetchCityPhoto(place)]);

    renderMainWeather(place, weather);
    renderHourly(weather);
    renderDaily(weather);
    renderCityPhoto(photo);

    cityInput.value = `${place.name}, ${place.country_code || place.country || ""}`.replace(/,\s*$/, "");
    document.title = `Weatherly — ${place.name}`;
  } finally {
    setLoading(false);
  }
}

async function useMyLocation() {
  if (!navigator.geolocation) {
    showStatus("Your browser does not provide geolocation. Search for a city instead.", "warning");
    return;
  }

  hideStatus();
  setLoading(true);

  try {
    const coords = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      });
    });

    const place = {
      name: "My location",
      latitude: coords.coords.latitude,
      longitude: coords.coords.longitude,
      country: "",
      admin1: "",
      country_code: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    const weather = await fetchWeather({ ...place, name: "My location" });
    const photo = await fetchCityPhoto(place);

    activePlace = place;
    activeWeather = weather;
    renderMainWeather(place, weather);
    renderHourly(weather);
    renderDaily(weather);
    renderCityPhoto(photo);
    cityInput.value = "My location";
    document.title = "Weatherly — My location";
  } catch (error) {
    const message = error?.code === 1
      ? "Location permission was denied. You can still search any city."
      : error?.code === 3
        ? "Location request timed out. Try again or search a city."
        : error?.message || "Unable to read your location.";
    showStatus(message, "warning");
  } finally {
    setLoading(false);
  }
}

function openGoogleWeather() {
  const name = activePlace?.name || cityInput.value.trim() || "Delhi";
  const country = activePlace?.country || activePlace?.country_code || "";
  const query = `weather in ${name}${country ? `, ${country}` : ""}`;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
}

async function refreshCurrentWeather() {
  if (!activePlace) return refreshDashboard(cityInput.value || "Delhi, India");
  hideStatus();
  setLoading(true);
  try {
    const [weather, photo] = await Promise.all([fetchWeather(activePlace), fetchCityPhoto(activePlace)]);
    renderMainWeather(activePlace, weather);
    renderHourly(weather);
    renderDaily(weather);
    renderCityPhoto(photo);
    showStatus("Weather data refreshed from the API.", "success");
    setTimeout(hideStatus, 1800);
  } finally {
    setLoading(false);
  }
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await refreshDashboard(cityInput.value);
  } catch (error) {
    showStatus(error.message || "Unable to load weather data.");
    setLoading(false);
  }
});

$("locationBtn").addEventListener("click", useMyLocation);
refreshBtn?.addEventListener("click", refreshCurrentWeather);
googleWeatherBtn?.addEventListener("click", openGoogleWeather);

$("unitBtn").addEventListener("click", () => {
  unitSystem = unitSystem === "celsius" ? "fahrenheit" : "celsius";
  localStorage.setItem("weatherly-units", unitSystem);
  updateUnitUi();

  if (activePlace && activeWeather) {
    renderMainWeather(activePlace, activeWeather);
    renderHourly(activeWeather);
    renderDaily(activeWeather);
  }
});

updateUnitUi();

(async function init() {
  setLoading(true);

  try {
    await refreshDashboard("Delhi, India");
  } catch (error) {
    showStatus(error.message || "Unable to load weather data.");
    setLoading(false);
  }

  renderCommonCities();
})();
