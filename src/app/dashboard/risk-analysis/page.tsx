"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Activity,
  MapPin,
  Loader2,
  Sprout
} from "lucide-react";
import { getUser, getToken } from "@/lib/authClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";

interface Crop {
  _id: string;
  cropType: string;
  location: string;
  farmSize: number;
  sowingMonth: string;
  predictedYield: number;
  yieldRange?: { min: number; max: number };
  riskLevel?: string;
  confidence?: string;
  weather?: { temperature: string; rainfall: string; humidity: string };
  createdAt: string;
}

export default function RiskAnalysisPage() {
  const user = getUser();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCrops() {
      try {
        const token = getToken();
        if (!token) throw new Error("Unauthorized");
        
        const res = await fetch("/api/crops", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error("Failed to load crop data");
        
        const json = await res.json();
        const activeCrops = (json.crops || []).filter((c: any) => c.status !== "retired");
        setCrops(activeCrops);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    
    fetchCrops();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-transparent pointer-events-none z-50 gap-4">
        <Loader2 className="h-8 w-8 text-accent-green animate-spin opacity-80" />
        <p className="text-sm text-text-secondary font-medium">Analyzing farm risks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        <Card className="bg-red-500/10 border-red-500/20 p-6">
          <p className="text-sm text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </p>
        </Card>
      </div>
    );
  }

  if (crops.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">🛡️</span> Risk Analysis
          </h1>
          <p className="text-base text-text-secondary">
            Identify potential threats to your crops and mitigate risks.
          </p>
        </div>
        <Card className="bg-white/5 border-white/10 p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-accent-green/10 mb-4">
            <Sprout className="h-8 w-8 text-accent-green" />
          </div>
          <CardTitle className="text-xl mb-2">No Active Crops</CardTitle>
          <CardDescription>
            You need to add some crops via Yield Prediction to see risk analysis.
          </CardDescription>
        </Card>
      </div>
    );
  }

  // Analytics Processing
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;

  const riskByCropType: Record<string, { total: number; high: number }> = {};
  
  // Clean up and format data for charts
  const cropRiskData = crops.map(c => {
    const riskLevel = (c.riskLevel || "Low").toLowerCase();
    
    if (riskLevel === "high") highRiskCount++;
    else if (riskLevel === "medium") mediumRiskCount++;
    else lowRiskCount++;

    const cType = c.cropType || "Unknown";
    if (!riskByCropType[cType]) riskByCropType[cType] = { total: 0, high: 0 };
    riskByCropType[cType].total++;
    if (riskLevel === "high") riskByCropType[cType].high++;
    
    // Parse confidence
    const confStr = c.confidence || "0%";
    const confidenceValue = parseFloat(confStr.replace("%", ""));
    const riskScore = 100 - confidenceValue; // Derived risk score

    return {
      name: `${c.cropType} (${c.location.split(',')[0]})`,
      riskScore: isNaN(riskScore) ? 10 : riskScore,
      predictedYield: c.predictedYield,
      confidence: confidenceValue,
      farmSize: c.farmSize,
      fullLevel: c.riskLevel
    };
  });

  const pieData = [
    { name: "High Risk", value: highRiskCount, color: "#ef4444" },
    { name: "Medium Risk", value: mediumRiskCount, color: "#f97316" },
    { name: "Low Risk", value: lowRiskCount, color: "#10b981" }
  ].filter(d => d.value > 0);

  // Take top 5 crops by risk score for the bar chart
  const topRisksRaw = [...cropRiskData].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  
  const highRiskCrops = crops.filter(c => (c.riskLevel || "").toLowerCase() === "high");

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-100px)] pb-10">
      {/* 1️⃣ Header Section */}
      <div className="relative">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🛡️</span> Risk Analysis
        </h1>
        <p className="text-base text-text-secondary">
          Analyze vulnerability patterns across your monitored fields.
        </p>
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      </div>

      {/* 2️⃣ Overview Metrics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 z-10 relative">
        <Card className="bg-white/5 border-white/10 hover:border-red-500/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Critical Hazards</CardTitle>
            <div className={`p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-red-400 mt-2">{highRiskCount}</div>
            <p className="text-xs text-text-secondary mt-1">Fields requiring immediate attention</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 hover:border-orange-400/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Monitoring Required</CardTitle>
            <div className={`p-2 rounded-lg bg-orange-400/10 border border-orange-400/20 text-orange-400`}>
              <TrendingDown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-orange-400 mt-2">{mediumRiskCount}</div>
            <p className="text-xs text-text-secondary mt-1">Crops with medium vulnerability</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 hover:border-accent-green/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Safe Assets</CardTitle>
            <div className={`p-2 rounded-lg bg-accent-green/10 border border-accent-green/20 text-accent-green`}>
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-accent-green mt-2">{lowRiskCount}</div>
            <p className="text-xs text-text-secondary mt-1">Optimal growth conditions detected</p>
          </CardContent>
        </Card>
      </div>

      {/* 3️⃣ Graphical Analysis Section */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 z-10 relative">
        
        {/* Chart 1: Risk Distribution Pie Chart */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent-green" />
              Risk Distribution
            </CardTitle>
            <CardDescription>Proportion of risk categories across all farms</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center pb-6 min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020402', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Top Vulnerable Crops Bar Chart */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              Top Vulnerable Fields
            </CardTitle>
            <CardDescription>Highest computed risk scores by derived confidence impact</CardDescription>
          </CardHeader>
          <CardContent className="pb-6 min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topRisksRaw}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#A0AAB2', fontSize: 12}} width={100} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#020402', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#A0AAB2', marginBottom: '8px' }}
                />
                <Bar dataKey="riskScore" name="Risk Score" radius={[0, 4, 4, 0]}>
                  {topRisksRaw.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.riskScore > 50 ? '#ef4444' : entry.riskScore > 20 ? '#f97316' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 4️⃣ Yield Risk Correlation Area Chart */}
      <Card className="bg-white/5 border-white/10 z-10 relative">
        <CardHeader>
          <CardTitle>Forecasted Yield vs Risk Profile</CardTitle>
          <CardDescription>Visualizing expected production relative to system confidence</CardDescription>
        </CardHeader>
        <CardContent className="pb-6 min-h-[320px]">
           <ResponsiveContainer width="100%" height={320}>
             <AreaChart
                data={[...cropRiskData].sort((a,b) => (a.predictedYield ?? 0) - (b.predictedYield ?? 0))}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
             >
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FF88" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#A0AAB2', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{fill: '#A0AAB2', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{fill: '#ef4444', fontSize: 12}} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020402', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="predictedYield" name="Est. Yield (ton/ha)" stroke="#00FF88" fillOpacity={1} fill="url(#colorYield)" />
                <Area yAxisId="right" type="step" dataKey="riskScore" name="Risk Impact (%)" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" />
             </AreaChart>
           </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 5️⃣ Actionable Insights List */}
      <h3 className="text-xl font-bold tracking-tight text-white mt-10 mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-500" /> Critical Review Focus
      </h3>
      
      {highRiskCount === 0 ? (
        <Card className="bg-accent-green/5 border-accent-green/20 p-6">
          <p className="text-sm text-accent-green flex items-center gap-2 font-medium">
            <ShieldCheck className="h-5 w-5" />
            No high-risk crops currently require critical attention. Keep up the good work.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {highRiskCrops.map((hc, idx) => (
            <Card key={idx} className="bg-red-500/5 border-red-500/20 hover:bg-red-500/10 transition-colors">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="p-3 bg-red-500/10 rounded-full shrink-0">
                  <MapPin className="h-5 w-5 text-red-400" />
                </div>
                <div className="space-y-2 w-full">
                  <div className="flex justify-between items-start">
                    <h4 className="text-white font-bold">{hc.cropType} Field</h4>
                    <Badge variant="destructive">DANGER</Badge>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Located in <span className="text-white font-medium">{hc.location}</span>. 
                    Prediction confidence stands at <span className="text-orange-300 font-medium">{hc.confidence}</span> with an expected yield of {hc.predictedYield?.toFixed(2)} tons/ha.
                  </p>
                  {hc.weather && (
                    <div className="mt-3 flex gap-4 text-xs font-medium text-text-secondary bg-black/20 p-2 rounded-lg border border-red-500/10">
                      <span>Temp: {hc.weather.temperature}°C</span>
                      <span>Rain: {hc.weather.rainfall}mm</span>
                      <span>Hum: {hc.weather.humidity}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}