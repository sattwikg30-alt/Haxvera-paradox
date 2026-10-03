"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CloudRain,
  MapPin,
  Thermometer,
  CloudSun,
  Loader2,
  AlertTriangle,
  Wind,
  Sun,
  Droplets
} from "lucide-react";
import { getUser, getToken } from "@/lib/authClient";
import { getCoordinates } from "@/lib/weather";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

interface Crop {
  _id: string;
  cropType: string;
  location: string;
}

interface DailyWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
}

interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  isDay: number;
}

export default function WeatherDashboard() {
  const user = getUser();
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [dailyForecast, setDailyForecast] = useState<DailyWeather[]>([]);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch user's crops to get unique locations
  useEffect(() => {
    async function fetchLocations() {
      try {
        const token = getToken();
        if (!token) throw new Error("Unauthorized");
        
        const res = await fetch("/api/crops", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Failed to load crop data");
        
        const json = await res.json();
        const crops: Crop[] = json.crops || [];
        
        const uniqueLocs = Array.from(new Set(crops.map(c => c.location).filter(Boolean)));
        setLocations(uniqueLocs);
        
        if (uniqueLocs.length > 0) {
          setSelectedLocation(uniqueLocs[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch locations");
      } finally {
        setLoading(false);
      }
    }
    
    fetchLocations();
  }, []);

  // 2. Fetch weather whenever selected location changes
  useEffect(() => {
    async function fetchForecast() {
      if (!selectedLocation) return;
      
      setWeatherLoading(true);
      setError(null);
      
      try {
        const coords = await getCoordinates(selectedLocation);
        if (!coords) throw new Error(`Could not find coordinates for ${selectedLocation}`);
        
        // Fetch 7-day daily forecast + current conditions
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,is_day&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
        );
        
        if (!response.ok) throw new Error("Weather API failed");
        
        const data = await response.json();
        
        // Parse Current Weather
        setCurrentWeather({
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          isDay: data.current.is_day
        });
        
        // Parse Daily Weather for Charts
        const dailyData: DailyWeather[] = [];
        const times = data.daily.time;
        for (let i = 0; i < times.length; i++) {
          // Format date like 'Mon, 12 Apr'
          const dateObj = new Date(times[i]);
          const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
          
          dailyData.push({
            date: dateStr,
            tempMax: data.daily.temperature_2m_max[i],
            tempMin: data.daily.temperature_2m_min[i],
            precipitation: data.daily.precipitation_sum[i]
          });
        }
        
        setDailyForecast(dailyData);
        
      } catch (err: any) {
        setError(err.message || "Failed to fetch weather data");
      } finally {
        setWeatherLoading(false);
      }
    }
    
    fetchForecast();
  }, [selectedLocation]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-transparent pointer-events-none z-50 gap-4">
        <Loader2 className="h-8 w-8 text-sky-400 animate-spin opacity-80" />
        <p className="text-sm text-text-secondary font-medium">Loading locations...</p>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">🌦️</span> Weather Intelligence
          </h1>
          <p className="text-base text-text-secondary">Get precision forecasts tailored to your fields.</p>
        </div>
        <Card className="bg-white/5 border-white/10 p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-sky-400/10 mb-4">
            <CloudSun className="h-8 w-8 text-sky-400" />
          </div>
          <CardTitle className="text-xl mb-2">No Locations Found</CardTitle>
          <CardDescription>
            You need to add some crops via Yield Prediction to unlock smart weather monitoring.
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-100px)] pb-10">
      {/* 1️⃣ Header Section */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">🌦️</span> Weather Intelligence
          </h1>
          <p className="text-base text-text-secondary">
            7-day environmental forecasting for localized crop optimization.
          </p>
        </div>
        
        {/* Location Selector */}
        <div className="bg-secondary-bg border border-white/10 rounded-xl p-2 flex items-center gap-3 min-w-[240px]">
          <MapPin className="h-5 w-5 text-sky-400 ml-2" />
          <select 
            className="bg-transparent border-none text-white font-medium outline-none w-full appearance-none cursor-pointer"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locations.map(loc => (
              <option key={loc} value={loc} className="bg-secondary-bg">{loc}</option>
            ))}
          </select>
        </div>
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-sky-400/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      </div>

      {error && !weatherLoading && (
        <Card className="bg-red-500/10 border-red-500/20 p-6 z-10 relative">
          <p className="text-sm text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </p>
        </Card>
      )}

      {/* Weather Content */}
      <div className="relative z-10">
        {weatherLoading ? (
           <Card className="bg-white/5 border-white/10 p-24 flex items-center justify-center">
             <div className="flex items-center gap-3 text-sky-400">
               <Loader2 className="h-6 w-6 animate-spin" />
               <span className="font-medium">Fetching satellite data...</span>
             </div>
           </Card>
        ) : dailyForecast.length > 0 ? (
          <div className="space-y-6">
            
            {/* 2️⃣ Current Conditions Summary */}
            {currentWeather && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10 hover:border-sky-400/30 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-secondary">Current Temp</CardTitle>
                    <Thermometer className="h-4 w-4 text-orange-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white tracking-tight">{currentWeather.temperature}°C</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 border-white/10 hover:border-sky-400/30 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-secondary">Humidity</CardTitle>
                    <Droplets className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white tracking-tight">{currentWeather.humidity}%</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 border-white/10 hover:border-sky-400/30 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-secondary">Wind Speed</CardTitle>
                    <Wind className="h-4 w-4 text-teal-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white tracking-tight">{currentWeather.windSpeed} <span className="text-sm font-normal text-text-secondary">km/h</span></div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 hover:border-sky-400/30 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-secondary">Environment</CardTitle>
                    {currentWeather.isDay ? <Sun className="h-4 w-4 text-yellow-400" /> : <CloudRain className="h-4 w-4 text-slate-400" />}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white tracking-tight">
                      {currentWeather.isDay ? 'Clear Day' : 'Night'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 3️⃣ Temperature Chart */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-400" />
                  7-Day Temperature Trend
                </CardTitle>
                <CardDescription>Daily high and low expected temperatures (°C)</CardDescription>
              </CardHeader>
              <CardContent className="h-80 w-full min-h-[320px] pb-6">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={dailyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTempMax" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTempMin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" tick={{fill: '#A0AAB2', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#A0AAB2', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020402', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#A0AAB2' }}/>
                    <Area type="monotone" dataKey="tempMax" name="High Temp" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTempMax)" />
                    <Area type="monotone" dataKey="tempMin" name="Low Temp" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorTempMin)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 4️⃣ Precipitation Chart */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudRain className="h-5 w-5 text-blue-400" />
                  Precipitation Forecast
                </CardTitle>
                <CardDescription>Expected rainfall accumulation (mm) over the next 7 days</CardDescription>
              </CardHeader>
              <CardContent className="h-80 w-full min-h-[320px] pb-6">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={dailyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" tick={{fill: '#A0AAB2', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#A0AAB2', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#020402', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="precipitation" name="Rainfall (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>
        ) : null}
      </div>
    </div>
  );
}