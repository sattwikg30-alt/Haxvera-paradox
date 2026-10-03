"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Sprout, MapPin, Maximize2, Droplets, Calendar, BarChart3, FlaskConical, Beaker, Leaf, Loader2, AlertCircle, Thermometer, CloudRain, Wind } from "lucide-react";
import { getToken } from "@/lib/authClient";
import { Badge } from "@/components/ui/badge";

const cropOptions = ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane"];
const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

interface PredictionResult {
  predicted_yield: number;
  lower_bound: number;
  upper_bound: number;
  risk_level: string;
  risk_score: number;
  explainability: {
    topFactors: string[];
    recommendations: string[];
    explanation: string[];
  };
}

interface ClimateData {
  temperature: number;
  rainfall: number;
  humidity: number;
  solar: number;
  soil: number;
}

export default function YieldPredictionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [climateUsed, setClimateUsed] = useState<ClimateData | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  
  const [formData, setFormData] = useState({
    crop: "",
    location: "",
    area: "",
    month: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // STEP 2 — Add Open Meteo geocoding
  async function getCoordinates(location: string) {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error("Location not found. Please try a different name.");
    }
    return {
      lat: data.results[0].latitude,
      lon: data.results[0].longitude,
      name: data.results[0].name
    };
  }

  // STEP 3 — Fetch climate
  async function getClimate(lat: number, lon: number) {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,shortwave_radiation,soil_moisture_0_to_1cm&timezone=auto`);
    const weatherData = await response.json();
    
    console.log("OPEN METEO RAW")
    console.log(weatherData)

    if (!weatherData.current) {
      throw new Error("Failed to fetch climate data.");
    }

    const temperature = weatherData.current.temperature_2m;
    const humidity = weatherData.current.relative_humidity_2m;
    const precipitation = weatherData.current.precipitation || 0;
    const solar = weatherData.current.shortwave_radiation || 18;
    const soil = weatherData.current.soil_moisture_0_to_1cm || 0.5;

    console.log("CLIMATE USED")
    console.log({
      temperature,
      humidity,
      precipitation,
      solar,
      soil
    })

    return {
      temperature,
      humidity,
      rainfall: precipitation,
      solar,
      soil
    };
  }

  // STEP 4 — Create submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = getToken();
    if (!token) {
      router.push("/signin");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setClimateUsed(null);
    setSaveStatus("idle");

    try {
      // 1. Get Coordinates
      const coords = await getCoordinates(formData.location);
      
      // 2. Get Climate
      const climate = await getClimate(coords.lat, coords.lon);
      setClimateUsed(climate);

      // 3. Prepare requestData
      const payload = {
        crop: formData.crop,
        district: coords.name,
        area: parseFloat(formData.area),
        month: formData.month,
        temperature: climate.temperature,
        rainfall: climate.rainfall,
        humidity: climate.humidity,
        solar: climate.solar,
        soil: climate.soil,
        lat: coords.lat,
        lon: coords.lon
      };

      console.log("ML REQUEST PAYLOAD")
      console.log(payload)

      // 4. Call ML API (Step 4: Use ngrok URL from env)
      const apiUrl = process.env.NEXT_PUBLIC_ML_API ?? "http://localhost:8000";
      console.log("ML API URL:", apiUrl)

      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      console.log("ML RESPONSE STATUS")
      console.log(response.status)

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Prediction API failed.");
      }

      const mlResult: PredictionResult = await response.json();
      console.log("ML RESPONSE DATA");
      console.log(mlResult);
      setResult(mlResult);

      // ── Persist to DB ──────────────────────────────────────────────────
      setSaveStatus("saving");
      try {
        const saveRes = await fetch("/api/crops", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // Form fields
            cropType: formData.crop,
            location: formData.location,
            farmSize: parseFloat(formData.area),
            sowingMonth: formData.month,

            // ML prediction outputs
            predictedYield: mlResult.predicted_yield,
            yieldMin: mlResult.lower_bound,
            yieldMax: mlResult.upper_bound,
            riskLevel:
              mlResult.risk_level.charAt(0).toUpperCase() +
              mlResult.risk_level.slice(1).toLowerCase(),
            confidence: `${(100 - mlResult.risk_score * 100).toFixed(0)}%`,

            // Weather snapshot used in prediction
            weatherTemp: climate.temperature,
            weatherRain: climate.rainfall,
            weatherHumidity: climate.humidity,
          }),
        });

        if (saveRes.ok) {
          setSaveStatus("saved");
        } else {
          console.warn("DB save returned non-OK status", saveRes.status);
          setSaveStatus("error");
        }
      } catch (saveErr) {
        console.error("DB save failed:", saveErr);
        setSaveStatus("error");
      }
      // ───────────────────────────────────────────────────────────────────
    } catch (err: any) {
      console.error("PREDICTION ERROR");
      console.error(err);
      if (err instanceof TypeError) {
        console.error("NETWORK FAILURE");
      }
      setError(err.message || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    formData.crop && 
    formData.location && 
    formData.area && 
    parseFloat(formData.area) > 0 &&
    formData.month;

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "MEDIUM": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "HIGH": return "bg-red-500/20 text-red-400 border-red-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="relative">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Yield Prediction</h1>
        <p className="text-text-secondary text-lg">Enter your farm details to get an AI-powered yield forecast.</p>
        <div className="absolute -top-6 -right-10 w-64 h-64 bg-accent-green/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      </div>

      <div className="grid gap-8 lg:grid-cols-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-secondary-bg/20 border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-green/10 text-accent-green">
                  <Sprout size={20} />
                </div>
                <div>
                  <CardTitle className="text-xl">Prediction Inputs</CardTitle>
                  <CardDescription className="text-text-secondary">Details used for the ML yield forecast.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  Crop Type <span className="text-accent-green">*</span>
                </label>
                <select
                  name="crop"
                  required
                  value={formData.crop}
                  onChange={handleChange}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 outline-none transition-all"
                >
                  <option value="">Select Crop</option>
                  {cropOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <MapPin size={14} className="text-text-secondary" />
                  Location (City / District) <span className="text-accent-green">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g. Nadia, Kolkata"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-secondary/30 focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Maximize2 size={14} className="text-text-secondary" />
                  Farm Size (acres) <span className="text-accent-green">*</span>
                </label>
                <input
                  type="number"
                  name="area"
                  required
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-secondary/30 focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Calendar size={14} className="text-text-secondary" />
                  Sowing Month <span className="text-accent-green">*</span>
                </label>
                <select
                  name="month"
                  required
                  value={formData.month}
                  onChange={handleChange}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 outline-none transition-all"
                >
                  <option value="">Select Month</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full bg-accent-green hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed text-background font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-green/20"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Predicting yield...
              </>
            ) : (
              "Generate Prediction"
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* DB Save status */}
        {saveStatus === "saving" && (
          <div className="flex items-center gap-2 text-xs text-text-secondary animate-pulse">
            <Loader2 size={14} className="animate-spin" />
            Saving to dashboard...
          </div>
        )}
        {saveStatus === "saved" && (
          <div className="flex items-center gap-2 text-xs text-accent-green">
            <CheckCircle2 size={14} />
            Prediction saved — your dashboard has been updated.
          </div>
        )}
        {saveStatus === "error" && (
          <div className="flex items-center gap-2 text-xs text-orange-400">
            <AlertCircle size={14} />
            Prediction shown but could not be saved to dashboard.
          </div>
        )}

        {/* STEP 8 — Display prediction UI */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-secondary-bg/30 border-accent-green/20 overflow-hidden shadow-2xl shadow-accent-green/5">
              <CardHeader className="bg-accent-green/5 border-b border-accent-green/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-green/20 text-accent-green">
                      <BarChart3 size={24} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Prediction Result</CardTitle>
                  </div>
                  <Badge className={`px-4 py-1 text-xs font-bold border ${getRiskColor(result.risk_level)}`}>
                    {result.risk_level} RISK
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-text-secondary text-sm font-medium mb-1">Estimated Yield</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-white tracking-tighter">
                          {result.predicted_yield.toFixed(2)}
                        </span>
                        <span className="text-accent-green font-bold text-lg">ton/ha</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-text-secondary text-xs mb-2">Confidence Interval (q20 - q80)</p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent-green/40 mx-auto" style={{ width: '60%' }} />
                        </div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-white font-mono text-sm">{result.lower_bound.toFixed(2)}</span>
                        <span className="text-white font-mono text-sm">{result.upper_bound.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Wind size={16} className="text-blue-400" />
                      Climate Data Used
                    </h3>
                    {climateUsed && (
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5">
                          <div className="flex items-center gap-3">
                            <Thermometer size={18} className="text-orange-400" />
                            <span className="text-text-secondary text-sm">Temperature</span>
                          </div>
                          <span className="text-white font-bold">{climateUsed.temperature}°C</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5">
                          <div className="flex items-center gap-3">
                            <CloudRain size={18} className="text-blue-400" />
                            <span className="text-text-secondary text-sm">Precipitation</span>
                          </div>
                          <span className="text-white font-bold">{climateUsed.rainfall}mm</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5">
                          <div className="flex items-center gap-3">
                            <Droplets size={18} className="text-blue-300" />
                            <span className="text-text-secondary text-sm">Humidity</span>
                          </div>
                          <span className="text-white font-bold">{climateUsed.humidity}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Explainability Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-secondary-bg/20 border-white/5 overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/[0.02] py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Beaker size={18} />
                    </div>
                    <CardTitle className="text-lg">Why this prediction?</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {result.explainability.explanation.map((item, idx) => (
                      <li key={idx} className={`flex items-start gap-3 text-sm ${idx === 0 ? 'text-text-secondary font-medium' : 'text-white'}`}>
                        {idx > 0 && <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />}
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className={`bg-secondary-bg/20 border-white/5 overflow-hidden border-l-4 ${
                result.risk_level === "LOW" ? "border-l-green-500" : 
                result.risk_level === "MEDIUM" ? "border-l-orange-500" : "border-l-red-500"
              }`}>
                <CardHeader className="border-b border-white/5 bg-white/[0.02] py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-green/10 text-accent-green">
                      <Leaf size={18} />
                    </div>
                    <CardTitle className="text-lg">Agronomic Recommendations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {result.explainability.recommendations.length > 0 ? (
                    <ul className="space-y-3">
                      {result.explainability.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-white">
                          <CheckCircle2 size={16} className="mt-0.5 text-accent-green shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-text-secondary italic py-2">
                      <AlertCircle size={16} />
                      <p>No major climate risks detected.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}