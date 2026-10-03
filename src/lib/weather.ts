/**
 * Weather & Geocoding Helpers
 * Uses Open-Meteo API (Free, no key required)
 */

export interface Coordinates {
  lat: number;
  lon: number;
  name: string;
  country: string;
  timezone: string;
}

export interface WeatherData {
  temperature: number;
  rainfall: number;
  humidity: number;
  windSpeed: number;
  condition: string;
}

/**
 * Convert location name (village/district) to coordinates
 */
export async function getCoordinates(location: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    );
    
    if (!response.ok) throw new Error("Geocoding API failed");
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];
    return {
      lat: result.latitude,
      lon: result.longitude,
      name: result.name,
      country: result.country,
      timezone: result.timezone
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Fetch current weather data for given coordinates
 */
export async function getWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto`
    );

    if (!response.ok) throw new Error("Weather API failed");

    const data = await response.json();
    
    if (!data.current) return null;

    return {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      rainfall: data.current.precipitation,
      windSpeed: data.current.wind_speed_10m,
      condition: data.current.precipitation > 0 ? "Rainy" : "Clear"
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
}