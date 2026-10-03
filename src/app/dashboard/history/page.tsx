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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  History,
  AlertTriangle,
  Loader2,
  CalendarDays,
  Sprout,
  MapPin,
  TrendingDown
} from "lucide-react";
import { getUser, getToken } from "@/lib/authClient";

interface CropHistory {
  _id: string;
  cropType: string;
  location: string;
  farmSize: number;
  sowingMonth: string;
  predictedYield: number;
  yieldRange?: { min: number; max: number };
  riskLevel?: string;
  confidence?: string;
  createdAt: string;
}

export default function HistoryDashboard() {
  const user = getUser();
  const [historyItems, setHistoryItems] = useState<CropHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const token = getToken();
        if (!token) throw new Error("Unauthorized");
        
        const res = await fetch("/api/crops", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Failed to load historical data");
        
        const json = await res.json();
        // The API returns crops sorted by createdAt descending
        setHistoryItems(json.crops || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch prediction history");
      } finally {
        setLoading(false);
      }
    }
    
    fetchHistory();
  }, []);

  const getRiskColor = (riskLevel: string | undefined) => {
    const r = (riskLevel || "Low").toLowerCase();
    if (r === "low" || r === "healthy") return "success";
    if (r === "high") return "destructive";
    return "warning";
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-transparent pointer-events-none z-50 gap-4">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin opacity-80" />
        <p className="text-sm text-text-secondary font-medium">Loading prediction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        <Card className="bg-red-500/10 border-red-500/20 p-6 z-10 relative">
          <p className="text-sm text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-100px)] pb-10">
      {/* Header Section */}
      <div className="relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🕰️</span> Prediction History
        </h1>
        <p className="text-base text-text-secondary">
          Track and review all previous AI yield analyses across your fields.
        </p>
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      </div>

      {historyItems.length === 0 ? (
        <Card className="bg-white/5 border-white/10 p-12 flex flex-col items-center justify-center text-center z-10 relative">
          <div className="p-4 rounded-full bg-indigo-500/10 mb-4 flex items-center justify-center">
            <History className="h-8 w-8 text-indigo-400 opacity-80" />
          </div>
          <CardTitle className="text-xl mb-2">No Past Predictions</CardTitle>
          <CardDescription>
            You haven't generated any yield predictions yet. Go to the Predict section to get started.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-6 z-10 relative">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary font-medium">Total Runs</p>
                  <p className="text-2xl font-bold text-white tracking-tight">{historyItems.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <History className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary font-medium">Last Prediction</p>
                  <p className="text-sm font-bold text-white tracking-tight mt-1 truncate max-w-[120px]">
                    {new Date(historyItems[0].createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical Table */}
          <Card className="bg-white/5 border-white/10 border-none shadow-none">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-lg">Database Records</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date / Time</TableHead>
                    <TableHead>Crop & Subject</TableHead>
                    <TableHead>Farm Size</TableHead>
                    <TableHead>Expected Yield</TableHead>
                    <TableHead>Risk Bounds</TableHead>
                    <TableHead className="text-right">Risk Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyItems.map((item) => (
                    <TableRow key={item._id} className="group transition-colors border-white/5">
                      <TableCell className="text-text-secondary">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Sprout className="h-3.5 w-3.5 text-accent-green" /> 
                            {item.cropType}
                          </span>
                          <span className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {item.location}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-slate-200 font-medium">
                        {item.farmSize} <span className="text-text-secondary text-xs font-normal">acres</span>
                      </TableCell>
                      
                      <TableCell className="font-bold text-accent-green text-base">
                        {item.predictedYield ? item.predictedYield.toFixed(2) : '—'} <span className="text-xs font-normal text-text-secondary ml-1">ton/ha</span>
                      </TableCell>
                      
                      <TableCell>
                        {item.yieldRange ? (
                          <div className="flex items-center gap-2 text-xs font-mono text-text-secondary bg-black/20 p-1.5 rounded-md border border-white/5 w-fit">
                            <TrendingDown className="h-3 w-3 text-sky-400" />
                            {item.yieldRange.min.toFixed(2)} - {item.yieldRange.max.toFixed(2)}
                          </div>
                        ) : (
                          <span className="text-text-secondary text-xs">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Badge variant={getRiskColor(item.riskLevel) as any}>
                          {item.riskLevel || 'UNKNOWN'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}