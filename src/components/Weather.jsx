import React, { useState } from 'react';

const api = {
  key: "7d79ac418ac9adf438f17e77f48fbae3",
  base: "https://api.openweathermap.org/data/2.5/"
};

const Weather = () => {
  const [query, setQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [recentCities, setRecentCities] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false); // Sidebar hidden by default

  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const updateRecentCities = (city) => {
    setRecentCities(prev => {
      const updated = [city, ...prev.filter(c => c.toLowerCase() !== city.toLowerCase())];
      return updated.slice(0, 3); // Max 3 recent cities
    });
  };

  const fetchWeather = async (cityName) => {
    try {
      const res = await fetch(`${api.base}weather?q=${cityName}&units=metric&appid=${api.key}`);
      const data = await res.json();

      if (data.cod !== 200) throw new Error(data.message);
      setWeatherData(data);

      const forecastRes = await fetch(`${api.base}forecast?q=${cityName}&units=metric&appid=${api.key}`);
      const forecastData = await forecastRes.json();
      setForecast(forecastData.list);

      updateRecentCities(data.name); // Update recent cities on search
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const searchWeather = async (e) => {
    if (e.key === "Enter") {
      await fetchWeather(query);
    }
  };

  const handleCityClick = (city) => {
    setQuery(city);
    fetchWeather(city);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white font-sans transition-all duration-300 px-4 md:px-8 py-10 relative">
      
      {/* Sidebar */}
      {showSidebar && (
        <div className="absolute left-4 top-10 w-64 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-md z-20">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">📍 Recently Searched</h3>
            <button
              className="bg-white/10 hover:bg-red-500/30 text-white px-2 py-1 rounded-full transition"
              onClick={() => setShowSidebar(false)}
              title="Hide"
            >
              ✖
            </button>
          </div>
          <ul className="space-y-2">
            {recentCities.length > 0 ? (
              recentCities.map((city, index) => (
                <li
                  key={index}
                  className="cursor-pointer px-2 py-1 rounded-md hover:bg-blue-800/40 transition-all"
                  onClick={() => handleCityClick(city)}
                >
                  {city}
                </li>
              ))
            ) : (
              <p className="text-gray-300 text-sm">No recent searches</p>
            )}
          </ul>
        </div>
      )}

      <div className={`transition-all duration-300 ${showSidebar ? "md:ml-72" : ""}`}>
        <div className="max-w-5xl mx-auto">

          {/* Toggle Sidebar Button */}
          {!showSidebar && (
            <div className="mb-6 flex justify-start">
              <button
                onClick={() => setShowSidebar(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full shadow-md border border-white/20 backdrop-blur-md transition-all duration-300"
              >
                <span className="text-purple-400 font-bold text-lg mr-2">＋</span> Recent Searches
              </button>
            </div>
          )}

          {/* Header & Search */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-wide mb-3">WeatherSphere 🌐</h1>
            <p className="text-gray-300 mb-6 text-lg">Get real-time weather, hourly and 5-day forecasts</p>
            <input
              type="text"
              className="w-full md:w-2/3 p-4 rounded-xl text-black text-lg focus:outline-none shadow-xl transition-all"
              placeholder="🔍 Type a city and hit Enter..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={searchWeather}
            />
          </div>

          {/* No Data Display */}
          {!weatherData && (
            <div className="mt-10 flex justify-center">
              <div className="text-center bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white/10">
                <img src="https://cdn-icons-png.flaticon.com/512/1163/1163661.png" alt="cloud" className="w-24 mx-auto mb-6 animate-float" />
                <h2 className="text-2xl font-semibold">Start typing a city name ⌨️</h2>
                <p className="text-gray-400 mt-2">We’ll show you current temperature, humidity, and future forecasts.</p>
              </div>
            </div>
          )}

          {/* Current Weather */}
          {weatherData && (
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-md shadow-2xl mb-10 transition-all border border-white/10 text-center">
              <h2 className="text-3xl font-semibold mb-2">{weatherData.name}, {weatherData.sys.country}</h2>
              <p className="text-gray-300 mb-4">{getCurrentDate()}</p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                  <img src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`} alt="weather-icon" />
                  <p className="text-xl capitalize">{weatherData.weather[0].description}</p>
                </div>
                <div className="text-6xl font-bold">{Math.round(weatherData.main.temp)}°C</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm text-gray-200">
                <p>💧 Humidity: {weatherData.main.humidity}%</p>
                <p>💨 Wind: {weatherData.wind.speed} m/s</p>
                <p>🌡️ Feels like: {Math.round(weatherData.main.feels_like)}°C</p>
                <p>🧭 Pressure: {weatherData.main.pressure} hPa</p>
              </div>
            </div>
          )}

          {/* 5-Day Forecast */}
          {forecast.length > 0 && (
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">🔮 5-Day Forecast</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {forecast
                  .filter(item => item.dt_txt.includes("12:00:00"))
                  .map((day, idx) => (
                    <div key={idx} className="bg-white/10 rounded-xl p-4 text-center shadow-lg backdrop-blur-lg border border-white/10 hover:scale-105 transform transition">
                      <p className="text-md mb-2 font-semibold">{new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                      <img
                        src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                        alt={day.weather[0].description}
                        className="mx-auto"
                      />
                      <p className="font-bold text-xl">{Math.round(day.main.temp)}°C</p>
                      <p className="text-sm capitalize">{day.weather[0].description}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Hourly Forecast */}
          {forecast.length > 0 && (
            <div className="mt-12 text-center">
              <h3 className="text-2xl font-semibold mb-4">⏰ Hourly Forecast</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 overflow-x-auto">
                {forecast.slice(0, 12).map((hour, idx) => (
                  <div key={idx} className="bg-white/10 rounded-xl p-4 text-center shadow-lg backdrop-blur-lg border border-white/10 hover:scale-105 transform transition">
                    <p className="text-sm mb-1 font-semibold">{new Date(hour.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <img
                      src={`http://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`}
                      alt={hour.weather[0].description}
                      className="mx-auto"
                    />
                    <p className="font-bold text-lg">{Math.round(hour.main.temp)}°C</p>
                    <p className="text-xs capitalize">{hour.weather[0].description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Weather;
