"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sprout, 
  MapPin, 
  Calendar, 
  Ruler, 
  History, 
  CloudSun, 
  Droplets, 
  FlaskConical,
  Bug,
  Dna,
  Tractor,
  Layers,
  Thermometer,
  Waves,
  RotateCcw,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AddCropPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call and analysis processing
    setTimeout(() => {
      // Redirect to the newly "created" crop details page
      router.push("/dashboard/crops/new-crop-id");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      <div className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">➕ Add New Crop</h1>
        <p className="text-text-secondary">Provide detailed farming conditions to get accurate yield predictions and risk analysis.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 🔹 A. BASIC (MANDATORY FIELDS) */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <span className="p-1.5 rounded-md bg-accent-green/20 text-accent-green">
                <Sprout className="h-4 w-4" />
              </span>
              Basic Information <span className="text-red-400 ml-1 text-sm">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Sprout className="h-3 w-3" /> Crop Type
              </label>
              <input required type="text" placeholder="e.g., Rice, Wheat" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent-green focus:ring-1 focus:ring-accent-green outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Location
              </label>
              <input required type="text" placeholder="e.g., North Zone" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent-green focus:ring-1 focus:ring-accent-green outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Ruler className="h-3 w-3" /> Farm Size (hectare/acre)
              </label>
              <input required type="number" step="0.1" placeholder="e.g., 2.5" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent-green focus:ring-1 focus:ring-accent-green outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Sowing Month
              </label>
              <select required defaultValue="" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent-green focus:ring-1 focus:ring-accent-green outline-none transition-all appearance-none">
                <option value="" disabled>Select month</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 🔹 B. CLIMATE & HISTORY INPUTS */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <span className="p-1.5 rounded-md bg-blue-400/20 text-blue-400">
                <CloudSun className="h-4 w-4" />
              </span>
              Climate & History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <History className="h-3 w-3" /> Previous Yield (tons/ha) <span className="text-white/40 text-xs text-normal">(Optional)</span>
              </label>
              <input type="number" step="0.1" placeholder="e.g., 3.0" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-blue-400 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <CloudSun className="h-3 w-3" /> Season
              </label>
              <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-blue-400 outline-none transition-all appearance-none">
                <option value="kharif">Kharif (Monsoon)</option>
                <option value="rabi">Rabi (Winter)</option>
                <option value="summer">Summer (Zaid)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 🔹 C. FARMING PRACTICES */}
        <Card className="bg-white/5 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 blur-[50px] pointer-events-none" />
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <span className="p-1.5 rounded-md bg-orange-400/20 text-orange-400">
                <Tractor className="h-4 w-4" />
              </span>
              Farming Practices
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">Detailed practices significantly improve AI prediction accuracy.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
            
            <div className="space-y-4 col-span-1 md:col-span-2 border border-white/5 p-4 rounded-xl bg-white/[0.01]">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2"><Droplets className="h-4 w-4 text-sky-400" /> Irrigation</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Type</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-sky-400 outline-none appearance-none">
                    <option>None</option>
                    <option>Drip</option>
                    <option>Sprinkler</option>
                    <option>Canal</option>
                    <option>Manual</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Frequency</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-sky-400 outline-none appearance-none">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 border border-white/5 p-4 rounded-xl bg-white/[0.01]">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2"><FlaskConical className="h-4 w-4 text-emerald-400" /> Fertilizer Usage</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Type</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white outline-none appearance-none focus:border-emerald-400">
                    <option>Organic</option>
                    <option>Chemical</option>
                    <option>Mixed</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Quantity <span className="text-white/30">(optional)</span></label>
                  <input type="text" placeholder="e.g., 50 kg/ha" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-emerald-400" />
                </div>
              </div>
            </div>

            <div className="space-y-4 border border-white/5 p-4 rounded-xl bg-white/[0.01]">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2"><Bug className="h-4 w-4 text-red-400" /> Pesticides</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Usage</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white outline-none appearance-none focus:border-red-400">
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Type <span className="text-white/30">(optional)</span></label>
                  <input type="text" placeholder="e.g., Herbicide" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-red-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Dna className="h-3 w-3" /> Seed Variety
              </label>
              <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white outline-none appearance-none focus:border-accent-green">
                <option>Local</option>
                <option>Hybrid</option>
                <option>High-yield variety (HYV)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Tractor className="h-3 w-3" /> Farming Type
              </label>
              <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white outline-none appearance-none focus:border-accent-green">
                <option>Conventional</option>
                <option>Organic</option>
                <option>Mixed</option>
              </select>
            </div>

          </CardContent>
        </Card>

        {/* 🔹 D. OPTIONAL ADVANCED INPUTS */}
        <Card className="bg-white/5 border-white/10 opacity-80 hover:opacity-100 transition-opacity">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-base flex items-center gap-2 text-white/80">
              <Layers className="h-4 w-4" />
              Advanced Data <span className="text-xs font-normal text-slate-400 ml-2">(Optional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5"><Layers className="h-3 w-3" /> Soil Type</label>
              <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white outline-none appearance-none text-slate-300 focus:text-white">
                <option value="">Unknown</option>
                <option>Loamy</option>
                <option>Clay</option>
                <option>Sandy</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5"><Thermometer className="h-3 w-3" /> Soil pH</label>
              <input type="number" step="0.1" placeholder="e.g., 6.5" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5"><Waves className="h-3 w-3" /> Water Source</label>
              <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white outline-none appearance-none text-slate-300 focus:text-white">
                <option value="">Unknown</option>
                <option>Rainfed</option>
                <option>Groundwater</option>
                <option>Canal</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5"><RotateCcw className="h-3 w-3" /> Crop Rotation</label>
              <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white outline-none appearance-none text-slate-300 focus:text-white">
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-accent-green hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-lg transition-all disabled:opacity-70 disabled:cursor-wait"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin mr-1"></div>
                Analyzing Data...
              </>
            ) : (
              <>
                Generate Prediction <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
