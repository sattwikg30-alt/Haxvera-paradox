"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MapPin, Calendar, Sprout, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getToken } from "@/lib/authClient";
import { Archive, ArchiveRestore, Loader2 } from "lucide-react";

export default function MyCropsPage() {
  const [crops, setCrops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCrops() {
      try {
        const token = getToken() || "dummy-token"; // Retrieve authentic token
        const response = await fetch("/api/crops", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.crops)) {
            setCrops(data.crops.filter((c: any) => c.status !== "retired"));
          }
        } else {
          console.error("Failed to fetch crops");
        }
      } catch (error) {
        console.error("Error fetching crops:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCrops();
  }, []);

  const toggleRetireStatus = async (e: React.MouseEvent, cropId: string, currentStatus: string) => {
    e.preventDefault(); // Stop native anchor
    e.stopPropagation(); // Stop Next.js Link bubbling
    
    const newStatus = currentStatus === "retired" ? "active" : "retired";
    const token = getToken() || "dummy-token";

    try {
      const resp = await fetch(`/api/crops/${cropId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (resp.ok) {
        // Optimistic UI update: instantly vanish the crop from the list completely
        setCrops(crops => crops.filter(c => c._id !== cropId));
      }
    } catch (err) {
      console.error("Failed to update crop status", err);
    }
  };

  const hasCrops = crops.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 🔝 Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            🌱 My Crops
            {!isLoading && <span className="text-lg font-normal text-text-secondary">({crops.length} Crops)</span>}
          </h1>
        </div>
        
        {/* ➕ Add Crop Button */}
        <Link 
          href="/dashboard/yield-prediction" 
          className="inline-flex items-center justify-center gap-2 bg-accent-green hover:bg-emerald-500 text-black font-semibold py-2 px-5 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Crop
        </Link>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-accent-green/30 border-t-accent-green rounded-full animate-spin" />
        </div>
      ) : !hasCrops ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Sprout className="h-12 w-12 text-white/30 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No crops added yet.</h3>
          <p className="text-text-secondary max-w-sm mb-6">
            Go to Yield Prediction to add crops and get tailored recommendations.
          </p>
          <Link 
            href="/dashboard/yield-prediction" 
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" /> Go to Yield Prediction
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crops.map((crop) => {
            return (
              <Link key={crop._id} href={`/dashboard/crops/${crop._id}`}>
                <Card className="bg-white/5 transition-all cursor-pointer group h-full relative overflow-hidden border-white/10 hover:border-accent-green/50">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg transition-colors text-white group-hover:text-accent-green">
                        {crop.cropType}
                      </h3>
                      
                      <div className="flex flex-col items-end gap-2">
                        {crop.riskLevel && (
                          <Badge variant={
                            crop.riskLevel === 'High' ? 'destructive' :
                            crop.riskLevel === 'Moderate' ? 'warning' : 'success'
                          }>
                            {crop.riskLevel} Risk
                          </Badge>
                        )}
                        <button 
                          onClick={(e) => toggleRetireStatus(e, crop._id, crop.status)}
                          className="px-2 py-1 rounded-md bg-white/5 hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Archive className="w-3 h-3" />
                          Retire
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-text-secondary flex items-center gap-2"><MapPin className="h-4 w-4" /> Location</span>
                        <span className="font-medium text-white text-right">{crop.location}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-text-secondary flex items-center gap-2"><Calendar className="h-4 w-4" /> Sowing Month</span>
                        <span className="font-medium text-white text-right">{crop.sowingMonth}</span>
                      </div>
                      
                      {crop.predictedYield && (
                        <div className="flex justify-between items-center text-sm pt-1">
                          <span className="text-text-secondary flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-400" /> Predicted Yield</span>
                          <span className="font-bold text-blue-400">{crop.predictedYield} t/ha</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}
