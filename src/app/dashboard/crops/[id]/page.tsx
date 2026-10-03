"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Leaf, AlertTriangle, Lightbulb, CloudRain, 
  TrendingUp, Scale, Thermometer, Droplets, Wind, Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getToken } from "@/lib/authClient";

export default function CropDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [crop, setCrop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("yield");

  useEffect(() => {
    async function fetchCropDetails() {
      try {
        const token = getToken() || "dummy-token";
        const res = await fetch(`/api/crops/${id}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCrop(data.crop);
          }
        } else {
          console.error("Failed to fetch crop data");
        }
      } catch (err) {
        console.error("Error connecting to database:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCropDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-accent-green/30 border-t-accent-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Crop Not Found</h2>
        <p className="text-text-secondary mb-6">The item you're looking for doesn't exist or isn't accessible.</p>
        <button onClick={() => router.push("/dashboard/my-crops")} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg text-white transition-colors">
          Return to My Crops
        </button>
      </div>
    );
  }

  // Safe extraction or default mocks if old crop data lacks it
  const weather = crop.weather || { 
    temperature: "28°C", 
    rainfall: "120mm", 
    humidity: "65%" 
  };
  
  const factors = crop.factors?.length ? crop.factors : [
    { name: "Soil Health Index", impact: "Favorable matching for roots." },
    { name: "Irrigation Setup", impact: "Sufficient to avoid drought stress." }
  ];
  
  const recommendations = crop.recommendations?.length ? crop.recommendations : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <button 
          onClick={() => router.push("/dashboard/my-crops")}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-secondary hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            {crop.cropType}
            {crop.riskLevel && (
              <Badge variant={
                crop.riskLevel === 'High' ? 'destructive' :
                crop.riskLevel === 'Moderate' ? 'warning' : 'success'
              } className="ml-2 text-sm">
                {crop.riskLevel} Risk
              </Badge>
            )}
          </h1>
          <p className="text-text-secondary mt-1 flex gap-3 text-sm">
            <span>📍 {crop.location}</span>
            <span>⏱️ Sown in {crop.sowingMonth}</span>
            <span>📐 {crop.farmSize} acres</span>
          </p>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left: Mini Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <SidebarButton 
            active={activeTab === "yield"} onClick={() => setActiveTab("yield")} 
            icon={<Leaf size={18} />} label="Yield Overview" 
          />
          <SidebarButton 
            active={activeTab === "risk"} onClick={() => setActiveTab("risk")} 
            icon={<AlertTriangle size={18} />} label="Risk Analysis" 
          />
          <SidebarButton 
            active={activeTab === "advice"} onClick={() => setActiveTab("advice")} 
            icon={<Lightbulb size={18} />} label="AI Advice" 
          />
          <SidebarButton 
            active={activeTab === "weather"} onClick={() => setActiveTab("weather")} 
            icon={<CloudRain size={18} />} label="Weather Impact" 
          />
        </div>

        {/* Right: Content Panel */}
        <div className="md:col-span-3 min-h-[400px]">
          
          {/* YIELD OVERVIEW TAB */}
          {activeTab === "yield" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Leaf className="text-accent-green" /> Yield Overview
              </h2>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-white/5 border-white/10 border-t-accent-green border-t-4">
                  <CardContent className="pt-6">
                    <p className="text-sm text-text-secondary mb-1">Predicted Yield</p>
                    <div className="text-4xl font-bold text-white">{crop.predictedYield || "N/A"}</div>
                    <p className="text-xs text-text-secondary mt-1 tracking-wider uppercase">tons / hectare</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="pt-6">
                    <p className="text-sm text-text-secondary mb-1 flex items-center gap-2">
                      <Scale size={14}/> Yield Range
                    </p>
                    <div className="text-2xl font-bold text-white mt-1">
                      {crop.yieldRange?.min || "N/A"} - {crop.yieldRange?.max || "N/A"}
                    </div>
                    <p className="text-xs text-text-secondary mt-2 tracking-wider">EXPECTED VARIANCE</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="pt-6">
                    <p className="text-sm text-text-secondary mb-1 flex items-center gap-2">
                       <TrendingUp size={14} className="text-blue-400"/> AI Confidence
                    </p>
                    <div className="text-2xl font-bold text-white mt-1 text-blue-400">
                      {crop.confidence || "N/A"}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* RISK ANALYSIS TAB */}
          {activeTab === "risk" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className={
                  crop.riskLevel === 'High' ? "text-red-400" :
                  crop.riskLevel === 'Moderate' ? "text-yellow-400" : "text-emerald-400"
                } /> Risk Analysis
              </h2>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2 border-b border-white/5">
                   <CardTitle className="text-md text-white flex items-center gap-2">
                     <Activity size={18}/> Influencing Factors
                   </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {factors.map((factor: any, i: number) => (
                    <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-lg bg-white/[0.02] border border-white/5 gap-2">
                      <span className="text-sm font-semibold text-white/90">{factor.name}</span>
                      <span className="text-sm text-text-secondary bg-black/20 px-3 py-1 rounded-full">{factor.impact}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI ADVICE TAB */}
          {activeTab === "advice" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="text-yellow-400" /> Actionable Recommendations
              </h2>
              
              <Card className="bg-white/5 border-white/10 border-l-yellow-400 border-l-4">
                <CardContent className="pt-6 space-y-5">
                  {recommendations.length > 0 ? recommendations.map((rec: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start p-2 hover:bg-white/[0.02] rounded-lg transition-colors">
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        rec.priority === 'High' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 
                        rec.priority === 'Medium' ? 'bg-yellow-400' : 'bg-emerald-400'
                      }`} />
                      <div>
                        <p className="text-sm text-slate-300 leading-relaxed">{rec.text}</p>
                        <p className="text-[10px] text-text-secondary/50 mt-1 uppercase mt-2">
                          Priority: {rec.priority}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400 italic py-4">No critical recommendations generated. Current inputs sit at optimal baselines.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* WEATHER IMPACT TAB */}
          {activeTab === "weather" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CloudRain className="text-sky-400" /> Weather Impact Baseline
              </h2>
              <p className="text-sm text-text-secondary mb-6">Modeled regional weather projections factoring into the AI calculation for this sowing month.</p>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-white/5 border-white/10 overflow-hidden relative">
                  <div className="absolute -right-4 -bottom-4 opacity-5"><Thermometer size={100}/></div>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2 text-orange-400">
                      <div className="p-2 bg-orange-400/20 rounded-lg"><Thermometer size={18}/></div>
                      <span className="font-medium text-sm text-white">Temperature</span>
                    </div>
                    <div className="text-2xl font-bold text-white mt-4">{weather.temperature}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 overflow-hidden relative">
                  <div className="absolute -right-4 -bottom-4 opacity-5"><CloudRain size={100}/></div>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2 text-sky-400">
                      <div className="p-2 bg-sky-400/20 rounded-lg"><CloudRain size={18}/></div>
                      <span className="font-medium text-sm text-white">Rainfall Expected</span>
                    </div>
                    <div className="text-2xl font-bold text-white mt-4">{weather.rainfall}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 overflow-hidden relative">
                  <div className="absolute -right-4 -bottom-4 opacity-5"><Droplets size={100}/></div>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2 text-indigo-400">
                      <div className="p-2 bg-indigo-400/20 rounded-lg"><Droplets size={18}/></div>
                      <span className="font-medium text-sm text-white">Avg Humidity</span>
                    </div>
                    <div className="text-2xl font-bold text-white mt-4">{weather.humidity}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Helper generic button component for the Sidebar
function SidebarButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
        active 
          ? "bg-accent-green text-black shadow-[0_0_15px_rgba(0,255,136,0.2)]" 
          : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white border border-transparent"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
