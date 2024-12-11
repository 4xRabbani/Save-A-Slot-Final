import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState(null);

    const getLocationName = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();

            const address = data.address;
            const location = address.city || address.town || address.village || address.suburb || address.county;
            setLocationName(location);
        } catch (err) {
            console.error('Failed to fetch location name:', err);
            setLocationName(null);
        }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        await getLocationName(latitude, longitude);

                        const response = await fetch(
                            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
                        );
                        const data = await response.json();
                        setWeather(data.current);
                        setLoading(false);
                    } catch (err) {
                        setError('Failed to fetch weather data');
                        setLoading(false);
                    }
                },
                () => {
                    setError('Location access denied');
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not supported');
            setLoading(false);
        }
    }, []);

    const getWeatherDescription = (code) => {
        const weatherCodes = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            56: 'Light freezing drizzle',
            57: 'Dense freezing drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            66: 'Light freezing rain',
            67: 'Heavy freezing rain',
            71: 'Slight snow fall',
            73: 'Moderate snow fall',
            75: 'Heavy snow fall',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail',
        };
        return weatherCodes[code] || 'Unknown';
    };

    const getWeatherIcon = (code) => {
        if (code === 0) return <Sun className="w-12 h-12" style={{ color: '#fbbf24' }} />;
        if (code >= 1 && code <= 3) return <Cloud className="w-12 h-12" style={{ color: '#9ca3af' }} />;
        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
            return <CloudRain className="w-12 h-12" style={{ color: '#60a5fa' }} />;
        }
        if ([71, 73, 75, 77, 85, 86].includes(code)) {
            return <CloudSnow className="w-12 h-12" style={{ color: '#bfdbfe' }} />;
        }
        if (code >= 95) return <CloudLightning className="w-12 h-12" style={{ color: '#fbbf24' }} />;
        return <Wind className="w-12 h-12" style={{ color: '#9ca3af' }} />;
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'baseline',
                marginBottom: '1rem',
                gap: '0.75rem'
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    margin: 0
                }}>
                    <i className="bi bi-thermometer-half"></i>
                    <u>Current Weather</u>
                </h3>
                {locationName && (
                    <span style={{
                        fontSize: '1.25rem',
                        color: '#2dd4bf',
                        backgroundColor: 'rgba(45, 212, 191, 0.1)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem'
                    }}>
                        {locationName}
                    </span>
                )}
            </div>

            {loading && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '200px'
                }}>
                    <div style={{
                        animation: 'spin 1s linear infinite',
                        border: '2px solid #fff',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        height: '2rem',
                        width: '2rem'
                    }}></div>
                </div>
            )}

            {error && (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <p style={{ color: '#f87171' }}>{error}</p>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                        Please check your location settings and try again.
                    </p>
                </div>
            )}

            {weather && (
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <p style={{ fontSize: '5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                {Math.round(weather.temperature_2m)}°F
                            </p>
                            <p style={{
                                color: '#9ca3af',
                                fontSize: '1.25rem',
                                marginBottom: '0.5rem'
                            }}>
                                <h6>Feels like {Math.round(weather.apparent_temperature)}°F</h6>
                            </p>
                            <p style={{
                                color: '#d1d5db',
                                textTransform: 'capitalize'
                            }}>
                                {getWeatherDescription(weather.weather_code)}
                            </p>
                        </div>
                        {getWeatherIcon(weather.weather_code)}
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '0.5rem',
                        paddingTop: '0.5rem',
                        marginTop: '0.5rem',
                        borderTop: '0.5px solid #374151'
                    }}>
                        <div>
                            <p style={{ color: '#9ca3af' }}>Humidity</p>
                            <p style={{ fontSize: '1.25rem' }}>{weather.relative_humidity_2m}%</p>
                        </div>
                        <div>
                            <p style={{ color: '#9ca3af' }}>Wind</p>
                            <p style={{ fontSize: '1.25rem' }}>{Math.round(weather.wind_speed_10m)} m/s</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherWidget;