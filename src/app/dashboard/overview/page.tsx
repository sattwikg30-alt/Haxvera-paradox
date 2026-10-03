"use client";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Sprout, 
  TrendingUp, 
  AlertTriangle, 
  CloudRain, 
  Waves,
  Sun,
  Bug
} from "lucide-react";
import { getUser } from "@/lib/authClient";

// Dummy Data
const yieldData = [
  { name: "Oct", yield: 2.1, max: 3.0 },
  { name: "Nov", yield: 2.3, max: 3.0 },
  { name: "Dec", yield: 2.2, max: 3.0 },
  { name: "Jan", yield: 2.4, max: 3.0 },
  { name: "Feb", yield: 2.6, max: 3.0 },
  { name: "Mar", yield: 2.4, max: 3.0 },
];

const rainfallData = [
  { name: "Oct", amount: 120, max: 200 },
  { name: "Nov", amount: 80, max: 200 },
  { name: "Dec", amount: 45, max: 200 },
  { name: "Jan", amount: 60, max: 200 },
  { name: "Feb", amount: 150, max: 200 },
  { name: "Mar", amount: 90, max: 200 },
];

const alerts = [
  { id: 1, date: "12 Mar", alert: "Heavy rainfall expected", severity: "Medium" },
  { id: 2, date: "10 Mar", alert: "Pest risk detected", severity: "High" },
  { id: 3, date: "05 Mar", alert: "Optimal time for fertilizing", severity: "Low" },
];

export default function FarmerOverview() {
  const user = getUser();
  return (
    <div className="space-y-6">
      <div className="relative">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Dashboard Overview</h1>
                <p className="text-sm text-text-secondary">Welcome back, {user?.name || "User"}. Here is the latest data for your farm.</p>
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-10 w-64 h-64 bg-accent-green/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      </div>

      {/* Top Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-accent-green/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Crop Status</CardTitle>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Sprout className="h-4 w-4 text-accent-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight mt-2">Healthy</div>
            <div className="mt-3 flex items-center">
              <Badge variant="success">Optimal</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-accent-green/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Predicted Yield</CardTitle>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight mt-2">2.4<span className="text-lg text-text-secondary ml-1 font-medium">tons/ha</span></div>
            <p className="text-xs text-text-secondary mt-3 font-medium">Confidence <span className="text-accent-green">82%</span></p>
          </CardContent>
        </Card>

        <Card className="hover:border-yellow-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Risk Level</CardTitle>
            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight mt-2 text-yellow-500">Medium</div>
            <div className="mt-3 flex items-center">
              <Badge variant="warning">Monitor closely</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-400/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Weather Today</CardTitle>
            <div className="p-2 rounded-lg bg-blue-400/10 border border-blue-400/20">
              <CloudRain className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight mt-2">28°C</div>
            <p className="text-xs text-text-secondary mt-3">Rain probability <span className="text-blue-400 font-bold">40%</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Yield Trend Custom Visualizer */}
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Yield Trend</CardTitle>
            <CardDescription>Predicted yield progression over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end pt-6">
            <div className="flex h-[200px] items-end justify-between gap-2">
              {yieldData.map((data, i) => {
                const heightPercentage = (data.yield / data.max) * 100;
                return (
                  <div key={i} className="flex flex-col items-center gap-3 w-full group">
                    <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {data.yield}t
                    </span>
                    <div className="w-full max-w-[40px] bg-white/5 rounded-t-md relative overflow-hidden group-hover:bg-white/10 transition-colors" style={{ height: "100%" }}>
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-accent-green/80 to-emerald-400/80 rounded-t-md transition-all duration-500" 
                        style={{ height: `${heightPercentage}%` }}
                      >
                        <div className="absolute top-0 w-full h-1 bg-white/40" />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-text-secondary">{data.name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Rain Trend & AI Reco */}
        <div className="space-y-6 lg:col-span-3">
          <Card className="border-accent-green/30 bg-accent-green/[0.02] shadow-[0_0_30px_rgba(0,255,136,0.05)] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/20 blur-[60px] pointer-events-none" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-green/20 border border-accent-green/30 rounded-xl">
                  <Sprout className="h-5 w-5 text-accent-green" />
                </div>
                <CardTitle className="text-lg">AI Action Plan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="mb-5">
                <span className="text-xs uppercase tracking-wider font-bold text-accent-green/80">Suggested Move</span>
                <p className="text-xl font-bold text-white mt-1">Plant Rice Variety IR64</p>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Key Indicators</p>
                <ul className="text-sm space-y-2.5 text-slate-300">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-green mt-1.5 shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
                    <span className="flex-1">Optimal incoming precipitation curve aligns with seedling phase.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-green mt-1.5 shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
                    <span className="flex-1">Soil pH stabilized at 6.5 across major zones.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Rainfall Activity</CardTitle>
              <CardDescription>Monthly trace amounts (mm)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-1.5 h-[100px] mt-4">
                {rainfallData.map((data, i) => {
                  const ht = (data.amount / data.max) * 100;
                  return (
                    <div key={i} className="group relative flex flex-col justify-end w-full h-full items-center">
                      <div className="absolute -top-6 text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        {data.amount}
                      </div>
                      <div 
                        className="w-full max-w-[12px] rounded-full bg-blue-500/20 group-hover:bg-blue-400/40 transition-colors"
                        style={{ height: `${ht}%` }}
                      >
                        <div className="w-full h-full rounded-full bg-gradient-to-t from-blue-600/50 to-blue-400/80" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Risk Analysis Widget */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Risk Overview</CardTitle>
            <CardDescription>Automated threat scanners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3.5 border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                  <Waves className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white">Flood</span>
              </div>
              <Badge variant="success">LOW</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3.5 border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-yellow-500/10 text-yellow-500">
                  <Sun className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white">Drought</span>
              </div>
              <Badge variant="warning">MED</Badge>
            </div>

            <div className="flex items-center justify-between p-3.5 border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-red-500/10 text-red-400">
                  <Bug className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white">Pest</span>
              </div>
              <Badge variant="destructive">HIGH</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>System notifications affecting your zones</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Notification</TableHead>
                  <TableHead>Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-bold text-white text-xs">{alert.date}</TableCell>
                    <TableCell className="text-slate-300">{alert.alert}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          alert.severity === "High" ? "destructive" : 
                          alert.severity === "Medium" ? "warning" : "default"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}