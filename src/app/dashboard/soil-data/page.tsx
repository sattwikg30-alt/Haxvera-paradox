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
  MapPin,
  Loader2,
  AlertTriangle,
  Leaf,
  Droplets,
  Thermometer,
  Waves
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
  LineChart,
  Line,
  Legend
} from "recharts";

interface Crop {
  _id: string;
  cropType: string;
  location: string;
}

interface SoilTimeSeries {
  date: string;
  soilMoisture: number;
  soilTemp: number;
  evapotranspiration: number;
}

interface CurrentSoilData {
  soilMoisture: number;
  soilTemp: number;
  evapotranspiration: number;
}

export default function SoilDataDashboard() {
  const user = getUser();
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  
  const [timeSeries, setTimeSeries] = useState<SoilTimeSeries[]>([]);
  const [currentData, setCurrentData] = useState<CurrentSoilData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
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

  // 2. Fetch Soil/Vegetation data whenever selected location changes
  useEffect(() => {
    async function fetchSoilAndVegetation() {
      if (!selectedLocation) return;
      
      setDataLoading(true);
      setError(null);
      
      try {
        const coords = await getCoordinates(selectedLocation);
        if (!coords) throw new Error(`Could not find coordinates for ${selectedLocation}`);
        
        // Fetch Soil Moisture, Soil Temp, and Evapotranspiration
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=soil_temperature_0cm,soil_moisture_0_to_1cm&daily=et0_fao_evapotranspiration&hourly=soil_temperature_0cm,soil_moisture_0_to_1cm&timezone=auto`
        );
        
        if (!response.ok) throw new Error("Soil API failed");
        
        const data = await response.json();
        
        setCurrentData({
          soilMoisture: data.current.soil_moisture_0_to_1cm,
          soilTemp: data.current.soil_temperature_0cm,
          evapotranspiration: data.daily.et0_fao_evapotranspiration[0] || 0
        });
        
        // C) Parse Daily Timeseries mapping mid-day (index 12 per day) for charts
        const seriesData: SoilTimeSeries[] = [];
        const dailyDates = data.daily.time;
        const et0 = data.daily.et0_fao_evapotranspiration;
        
        for (let i = 0; i < dailyDates.length; i++) {
          const dateObj = new Date(dailyDates[i]);
          const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
          
          // Map hourly arrays to midday (using 12th index offsets)
          const noonIndex = (i * 24) + 12; 
          const moisture = data.hourly.soil_moisture_0_to_1cm[noonIndex] ?? data.hourly.soil_moisture_0_to_1cm[i*24];
          const temp = data.hourly.soil_temperature_0cm[noonIndex] ?? data.hourly.soil_temperature_0cm[i*24];

          seriesData.push({
            date: dateStr,
            soilMoisture: parseFloat(Math.max(0, moisture * 100).toFixed(1)), // convert to %
            soilTemp: temp,
            evapotranspiration: et0[i]
          });
        }
        
        setTimeSeries(seriesData);
        
      } catch (err: any) {
        setError(err.message || "Failed to fetch soil data");
      } finally {
        setDataLoading(false);
      }
    }
    
    fetchSoilAndVegetation();
  }, [selectedLocation]);

  // Loading States
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-transparent pointer-events-none z-50 gap-4">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin opacity-80" />
        <p className="text-sm text-text-secondary font-medium">Loading terrain data...</p>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">🌱</span> Soil & Vegetation
          </h1>
          <p className="text-base text-text-secondary">Track soil health, moisture levels, and crop vitality.</p>
        </div>
        <Card className="bg-white/5 border-white/10 p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-amber-500/10 mb-4">
            <Leaf className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="text-xl mb-2">No Plot Data Found</CardTitle>
          <CardDescription>
            You need to add some crops via Yield Prediction to unlock soil intelligence.
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
            <span className="text-4xl">🌱</span> Soil & Vegetation
          </h1>
          <p className="text-base text-text-secondary">
            Daily terrain intelligence for optimized irrigation and crop health.
          </p>
        </div>
        
        {/* Location Selector */}
        <div className="bg-secondary-bg border border-white/10 rounded-xl p-2 flex items-center gap-3 min-w-[240px]">
          <MapPin className="h-5 w-5 text-amber-500 ml-2" />
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
        <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      </div>

      {error && !dataLoading && (
        <Card className="bg-red-500/10 border-red-500/20 p-6 z-10 relative">
          <p className="text-sm text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </p>
        </Card>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        {dataLoading ? (
           <Card className="bg-white/5 border-white/10 p-24 flex items-center justify-center">
             <div className="flex items-center gap-3 text-amber-500">
               <Loader2 className="h-6 w-6 animate-spin" />
               <span className="font-medium">Connecting to satellites...</span>
             </div>
           </Card>
        ) : timeSeries.length > 0 ? (
          <div className="space-y-6">
            
            {/* 2️⃣ Current Conditions Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Soil Moisture */}
              {currentData && (
                <>
                  <Card className="bg-white/5 border-white/10 hover:border-blue-400/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-text-secondary">Topsoil Moisture</CardTitle>
                      <Droplets className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white tracking-tight">
                        {Math.max(0, currentData.soilMoisture * 100).toFixed(1)}<span className="text-sm font-normal text-text-secondary">%</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">Optimal range: 20-60%</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/5 border-white/10 hover:border-amber-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-text-secondary">Soil Temperature</CardTitle>
                      <Thermometer className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white tracking-tight">{currentData.soilTemp}°C</div>
                      <p className="text-xs text-text-secondary mt-1">Surface root layer (0cm)</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/5 border-white/10 hover:border-cyan-400/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-text-secondary">Evapotranspiration</CardTitle>
                      <Waves className="h-4 w-4 text-cyan-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white tracking-tight">
                        {currentData.evapotranspiration.toFixed(1)}<span className="text-sm font-normal text-text-secondary"> mm/day</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">Water loss rate</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* 3️⃣ Soil Moisture Trend Chart */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-400" />
                  Topsoil Moisture Dynamics (7-Day Forecast)
                </CardTitle>
                <CardDescription>Daily expected percentage of topsoil moisture mapping soil saturation capabilities.</CardDescription>
              </CardHeader>
              <CardContent className="pb-6 min-h-[320px]">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" tick={{fill: '#A0AAB2', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#A0AAB2', fontSize: 12}} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 10']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020402', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="soilMoisture" name="Soil Moisture (%)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMoisture)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* 4️⃣ Soil Temperature Chart */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-amber-500" />
                    Soil Surface Thresholds
                  </CardTitle>
                  <CardDescription>Daily midday root zone temperature</CardDescription>
                </CardHeader>
                <CardContent className="pb-6 min-h-[280px]">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" tick={{fill: '#A0AAB2', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fill: '#A0AAB2', fontSize: 12}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#020402', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Line type="monotone" dataKey="soilTemp" name="Temp (°C)" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 5️⃣ Evapotranspiration Chart */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Waves className="h-5 w-5 text-cyan-400" />
                    Water Loss (ET₀)
                  </CardTitle>
                  <CardDescription>Overall vaporization rate evaluating irrigation needs</CardDescription>
                </CardHeader>
                <CardContent className="pb-6 min-h-[280px]">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" tick={{fill: '#A0AAB2', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fill: '#A0AAB2', fontSize: 12}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: '#020402', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="evapotranspiration" name="Loss (mm)" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}