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
  Users, 
  LineChart as LineChartIcon, 
  Activity, 
  CheckCircle,
  Database,
  Cpu
} from "lucide-react";

// Dummy Data
const usageData = [
  { name: "Mon", queries: 120, max: 400 },
  { name: "Tue", queries: 180, max: 400 },
  { name: "Wed", queries: 250, max: 400 },
  { name: "Thu", queries: 210, max: 400 },
  { name: "Fri", queries: 290, max: 400 },
  { name: "Sat", queries: 310, max: 400 },
  { name: "Sun", queries: 380, max: 400 },
];

const growthData = [
  { step: "Oct", value: "50", increase: "+12%" },
  { step: "Nov", value: "75", increase: "+50%" },
  { step: "Dec", value: "90", increase: "+20%" },
  { step: "Jan", value: "110", increase: "+22%" },
  { step: "Feb", value: "128", increase: "+16%" },
];

const farmers = [
  { id: 1, name: "David Miller", location: "Midwest Region", crop: "Corn", lastActive: "2 hrs ago", risk: "Low" },
  { id: 2, name: "Sarah Jenkins", location: "Northern Valley", crop: "Wheat", lastActive: "5 hrs ago", risk: "Medium" },
  { id: 3, name: "Robert Chen", location: "Eastern Plains", crop: "Rice", lastActive: "1 day ago", risk: "High" },
  { id: 4, name: "Maria Garcia", location: "Southern Delta", crop: "Cotton", lastActive: "2 mins ago", risk: "Low" },
];

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div className="relative">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Admin Overview</h1>
        <p className="text-sm text-text-secondary">System telemetry and platform performance.</p>
        
        <div className="absolute top-0 right-32 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />
      </div>

      {/* Top Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Registered Farmers</CardTitle>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Users className="h-4 w-4 text-slate-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mt-2">128</div>
            <p className="text-xs text-accent-green mt-3 flex items-center gap-1 font-bold tracking-wide">
              +12% <span className="text-text-secondary font-normal ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Inference Queries</CardTitle>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Cpu className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mt-2">892</div>
            <p className="text-xs text-accent-green mt-3 flex items-center gap-1 font-bold tracking-wide">
              +24% <span className="text-text-secondary font-normal ml-1">last 7 days</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Network Active</CardTitle>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Activity className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mt-2">74</div>
            <div className="mt-3 flex items-center gap-2">
               <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Nodes online</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Model Precision</CardTitle>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <CheckCircle className="h-4 w-4 text-accent-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mt-2">87.5%</div>
            <div className="mt-3 flex items-center">
              <Badge variant="success">Validated</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualizer Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Prediction Usage Histogram */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Inference Load</CardTitle>
            <CardDescription>Volume of AI predictions handled per day</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end pt-4">
            <div className="flex h-[180px] items-end justify-between gap-1 w-full">
              {usageData.map((d, i) => {
                const ht = (d.queries / d.max) * 100;
                return (
                  <div key={i} className="flex flex-col items-center gap-2 w-full group">
                    <span className="text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      {d.queries}
                    </span>
                    <div 
                      className="w-full bg-accent-green/10 rounded-t-sm relative transition-all group-hover:bg-accent-green/20"
                      style={{ height: `${ht}%` }}
                    >
                      <div className="absolute top-0 inset-x-0 h-1 bg-accent-green shadow-[0_0_10px_rgba(0,255,136,0.8)]" />
                    </div>
                    <span className="text-[10px] font-medium text-text-secondary uppercase">{d.name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* User Growth Tracker */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Expansion</CardTitle>
            <CardDescription>Cumulative active farmer growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 pt-2">
              {growthData.map((item, index) => (
                <div key={index} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.step}</h4>
                      <p className="text-xs text-text-secondary font-medium">{item.value} users</p>
                    </div>
                  </div>
                  <div className="text-accent-green text-sm font-bold bg-accent-green/10 px-2 py-1 rounded-md border border-accent-green/20 align-middle">
                    {item.increase}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables & System Info */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {/* Farmers Table */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Active Client Nodes</CardTitle>
            <CardDescription>Recent farmers running predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Primary Crop</TableHead>
                  <TableHead>Last Ping</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farmers.map((farmer) => (
                  <TableRow key={farmer.id}>
                    <TableCell className="font-bold text-white tracking-wide">{farmer.name}</TableCell>
                    <TableCell className="text-slate-300 text-xs">{farmer.location}</TableCell>
                    <TableCell>
                       <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-md text-xs font-medium text-slate-200">
                         {farmer.crop}
                       </span>
                    </TableCell>
                    <TableCell className="text-text-secondary text-xs">{farmer.lastActive}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          farmer.risk === "High" ? "destructive" : 
                          farmer.risk === "Medium" ? "warning" : "success"
                        }
                      >
                        {farmer.risk}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="md:col-span-1 border-t-2 border-t-accent-green">
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-1.5 bg-accent-green/10 rounded-md">
                <Database className="h-4 w-4 text-accent-green" />
              </div>
              <CardTitle>Core System</CardTitle>
            </div>
            <CardDescription>Database and models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Engine State</p>
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <span className="text-sm font-bold text-white">Online</span>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF88] shadow-[0_0_8px_#00FF88]"></span>
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Architecture</p>
              <p className="text-sm font-medium text-slate-300">Distributed Multi-Node</p>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Dataset ID</p>
              <Badge variant="outline" className="font-mono text-[10px] border-white/10 text-slate-400">v2.1.0-alpha</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}