import { useEffect, useState } from "react";
import "./Weather.css";

const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const VILNIUS_TIME_ZONE = "Europe/Vilnius";

function getWeatherInfo(code) {
  if (code === 0) return { label: "Giedra", icon: "☀️" };
  if (code === 1) return { label: "Daugiausia giedra", icon: "🌤️" };
  if (code === 2) return { label: "Debesuota su pragiedruliais", icon: "⛅" };
  if (code === 3) return { label: "Debesuota", icon: "☁️" };
  if (code === 45 || code === 48) return { label: "Rūkas", icon: "🌫️" };
  if (code >= 51 && code <= 57) return { label: "Dulksna", icon: "🌦️" };
  if (code >= 61 && code <= 67) return { label: "Lietus", icon: "🌧️" };
  if (code >= 71 && code <= 77) return { label: "Sniegas", icon: "🌨️" };
  if (code >= 80 && code <= 82) return { label: "Lietaus liūtys", icon: "🌧️" };
  if (code === 85 || code === 86) return { label: "Sniego liūtys", icon: "🌨️" };
  if (code >= 95) return { label: "Perkūnija", icon: "⛈️" };
  return { label: "Oro sąlygos nežinomos", icon: "🌡️" };
}

function formatToday(date) {
  const localDate = new Date(`${date}T12:00:00`);

  return new Intl.DateTimeFormat("lt-LT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: VILNIUS_TIME_ZONE,
  }).format(localDate);
}

function Weather() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const url = new URL(WEATHER_URL);
    url.search = new URLSearchParams({
      latitude: "54.6872",
      longitude: "25.2797",
      current: "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      forecast_days: "1",
      timezone: VILNIUS_TIME_ZONE,
      temperature_unit: "celsius",
      wind_speed_unit: "kmh",
    }).toString();

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Orai šiuo metu nepasiekiami.");
        }

        return response.json();
      })
      .then((data) => setWeather(data))
      .catch(() => setError("Nepavyko įkelti orų. Bandykite vėliau."))
      .finally(() => setIsLoading(false));
  }, []);

  const currentInfo = weather
    ? getWeatherInfo(weather.current.weather_code)
    : null;

  return (
    <section className="weather-card" aria-label="Vilniaus šiandienos orai">
      <header className="weather-card__header">
        <div>
          <p className="weather-card__eyebrow">Vilnius</p>
          <h2>Šiandienos orai</h2>
        </div>
        <span className="weather-card__location" aria-hidden="true">⌖</span>
      </header>

      {isLoading && <p className="weather-card__message">Kraunama orų prognozė...</p>}
      {!isLoading && error && <p className="weather-card__message" role="alert">{error}</p>}

      {!isLoading && weather && (
        <>
          <p className="weather-card__date">{formatToday(weather.daily.time[0])}</p>

          <div className="weather-card__current">
            <span className="weather-card__icon" aria-hidden="true">
              {currentInfo.icon}
            </span>
            <div>
              <p className="weather-card__condition">{currentInfo.label}</p>
              <p className="weather-card__temperature">
                {Math.round(weather.current.temperature_2m)}°
              </p>
            </div>
          </div>

          <p className="weather-card__range">
            Min. {Math.round(weather.daily.temperature_2m_min[0])}°
            <span aria-hidden="true"> · </span>
            Maks. {Math.round(weather.daily.temperature_2m_max[0])}°
          </p>

          <div className="weather-card__details">
            <p><span>Jaučiama kaip</span><strong>{Math.round(weather.current.apparent_temperature)}°</strong></p>
            <p><span>Lietaus tikimybė</span><strong>{weather.daily.precipitation_probability_max[0]}%</strong></p>
            <p><span>Vėjas</span><strong>{Math.round(weather.current.wind_speed_10m)} km/val.</strong></p>
          </div>
        </>
      )}
    </section>
  );
}

export default Weather;
