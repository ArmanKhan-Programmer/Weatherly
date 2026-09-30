# 🌤️ Weatherly — Live Weather Dashboard


## 🚀 Live Demo

👉 **[Open Weatherly Live](https://armankhan-programmer.github.io/Weatherly/)**

Weatherly is a modern, responsive weather dashboard built with **HTML, CSS, and JavaScript**. It lets users search for cities, view current weather conditions, explore hourly and 7-day forecasts, see city photography, and compare weather across popular cities.

> **Data note:** Weatherly displays weather data from **Open-Meteo**. Its values may differ from Google's weather panel because Google uses its own weather/forecast data pipeline.

## ✨ Features

- 🔎 Search weather by city
- 📍 Use browser location to detect the user's approximate current location
- 🌡️ Current temperature and feels-like temperature
- 🌧️ Rain probability and precipitation information
- 💧 Humidity and cloud cover
- 💨 Wind speed and wind direction
- 👁️ Visibility
- 🌅 Sunrise and sunset
- 🕐 Local time for the selected city
- ☀️ Dynamic weather scene for clear, cloudy, foggy, rainy, snowy, and stormy conditions
- 🌙 Day/night-aware weather presentation
- 📊 Today's minimum and maximum temperature
- 🕒 Hourly forecast
- 📅 7-day forecast
- 🏙️ Popular city weather cards
- 🖼️ Dynamic city/landmark photography
- 🌡️ Celsius / Fahrenheit switching
- 💨 km/h / mph switching
- 🔄 Manual weather refresh
- 🔍 Quick Google weather verification button
- 📱 Responsive design for desktop, tablet, and mobile
- ♿ Accessible labels and reduced-motion support
- ⚡ No build tool or backend required

## 🛠️ Technologies Used

- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **Bootstrap 5**
- **Font Awesome**
- **Google Fonts — Inter & Poppins**
- **Open-Meteo Geocoding API**
- **Open-Meteo Forecast API**
- **Wikipedia / MediaWiki API** for city/landmark images
- Browser **Geolocation API**
- Browser **LocalStorage** for unit preference

## 📡 APIs

### Open-Meteo

Weatherly uses Open-Meteo for geocoding and weather/forecast data.

- Geocoding: `https://geocoding-api.open-meteo.com/`
- Forecast: `https://api.open-meteo.com/`

The application requests current, hourly, and daily weather variables including temperature, apparent temperature, humidity, precipitation, weather code, wind, visibility, sunrise, and sunset.

**Open-Meteo documentation:**  
https://open-meteo.com/en/docs

### Wikipedia / MediaWiki

City and landmark photography is retrieved dynamically through the Wikipedia MediaWiki API when an appropriate image is available.

**MediaWiki API documentation:**  
https://www.mediawiki.org/wiki/API:Main_page

## 📁 Project Structure

```text
Weatherly/
│
├── index.html       # Main application structure
├── style.css        # Responsive UI, animations and weather scenes
├── script.js        # API calls, weather logic and UI interactions
└── README.md        # Project documentation
```

## 🚀 Getting Started

No installation or backend server is required.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/weatherly.git
```

### 2. Open the project

```bash
cd weatherly
```

### 3. Run it

The simplest option is to open:

```text
index.html
```

For the best browser experience, you can also use **VS Code Live Server**.

### Using VS Code Live Server

1. Open the project in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

## 🎯 How to Use

### Search a city

Enter a city such as:

```text
Agra, India
```

or:

```text
London, UK
```

Weatherly geocodes the location and loads its latest available weather data.

### Use your location

Click the location-crosshair button in the navigation bar and allow the browser to access your location.

> Browser geolocation requires permission and may require HTTPS or a secure local development environment.

### Change units

Use the unit button to switch between:

- Celsius ↔ Fahrenheit
- km/h ↔ mph

Your unit preference is saved in the browser using LocalStorage.

### Refresh weather

Use the refresh button whenever you want to request fresh weather data.

Weather responses are **not stored indefinitely**, preventing an old temperature from being displayed during a later search or refresh.

### Verify with Google

The **Check Google** button opens a Google weather search for the selected city.

This is useful for comparing the displayed Open-Meteo model values with Google's weather result.

## 🎨 UI Highlights

Weatherly uses a modern dashboard style with:

- Glassmorphism cards
- Gradient backgrounds
- Dynamic weather scenes
- Animated weather effects
- City photography
- Compact information cards
- Responsive grids
- Hover interactions
- Mobile-friendly navigation

The interface is intentionally information-dense so important weather details remain visible without excessive empty space.

## ⚠️ Weather Data Accuracy

Weather applications can show different values for the same city.

For example, Weatherly may show a temperature that is slightly different from Google's weather result. This does **not automatically mean the application is broken**.

Possible reasons include:

- Different weather models
- Different observation stations
- Different update times
- Different geographic coordinates
- Different interpolation methods
- Different forecast providers

Weatherly therefore identifies its source directly in the interface as:

```text
Open-Meteo model data
```

The project does not claim to reproduce Google's weather values exactly.

## 🔐 Privacy

Weatherly does not require an account or database.

The application only uses browser geolocation when the user explicitly requests it and grants permission.

The selected temperature unit is stored locally in the browser.

## 🌐 Deployment

Weatherly can be deployed as a static website using:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any static web hosting service

### GitHub Pages

1. Push the project to a GitHub repository.
2. Open **Settings → Pages**.
3. Select the branch containing `index.html`.
4. Save the Pages configuration.
5. GitHub will generate the public website URL.

## 📸 Screenshots

Add screenshots of your project here after deployment:

```md
![Weatherly Dashboard](screenshots/dashboard.png)
```

Recommended screenshots:

- Main weather dashboard
- City search result
- Hourly forecast
- 7-day forecast
- Mobile layout

## 🔮 Future Improvements

Possible future upgrades:

- Weather alerts
- Air-quality information
- UV index
- Pollen information
- More detailed precipitation charts
- Favorite cities
- Recent searches
- Weather radar integration
- Automatic background refresh
- PWA/offline support
- Better image attribution and image fallback handling
- More weather statistics

## 👨‍💻 Author

**Arman Khan**

Computer Science Engineering Student

Interested in:

- Java
- Backend Development
- Web Development
- AI / ML

## 📄 License

This project is available for educational and personal portfolio use.

If you reuse or modify the project, please keep the relevant third-party API attribution and documentation links.

---

⭐ If you like the project, consider giving the repository a star!
