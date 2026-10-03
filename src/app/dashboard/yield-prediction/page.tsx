"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Sprout, MapPin, Maximize2, Droplets, Calendar, BarChart3, FlaskConical, Beaker, Leaf } from "lucide-react";
import { getToken } from "@/lib/authClient";

const cropOptions = ["Rice", "Wheat", "Maize", "Potato", "Mustard", "Sugarcane", "Other"];
const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];
const fertilizers = ["Urea", "DAP", "NPK", "Organic compost", "None"];
const farmingTypes = ["Organic", "Chemical", "Mixed"];

export default function YieldPredictionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    crop: "",
    location: "",
    farmSize: "",
    irrigation: "",
    sowingMonth: "",
    previousYield: "",
    fertilizer: "",
    seedVariety: "",
    farmingType: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = getToken();
    if (!token) {
      router.push("/signin");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        router.push("/signin");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log("Prediction success:", data);
        router.push("/dashboard/prediction-result");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Prediction failed. Please try again.");
      }
    } catch (error) {
      console.error("Prediction failed:", error);
      alert("A network error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = 
    formData.crop && 
    formData.location && 
    formData.farmSize && 
    formData.irrigation && 
    formData.sowingMonth;

return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="relative">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Yield Prediction</h1>
        <p className="text-text-secondary text-lg">Enter your farm details to get an AI-powered yield forecast.</p>
        <div className="absolute -top-6 -right-10 w-64 h-64 bg-accent-green/5 blur-[100px] rounded-full pointer-events-none -z-10" />
</div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Farm Information */}
        <Card className="bg-secondary-bg/20 border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-green/10 text-accent-green">
                <Sprout size={20} />
              </div>
              <div>
                <CardTitle className="text-xl">Farm Information</CardTitle>
                <CardDescription className="text-text-secondary">Basic details about your crop and location.</CardDescription>
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
                Location (Village / District) <span className="text-accent-green">*</span>
              </label>
              <input
                type="text"
                name="location"
                required
                placeholder="Enter your village or district"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-secondary/30 focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 outline-none transition-all"
              />
              <p className="text-[10px] text-text-secondary/70">Used to analyze weather and soil conditions automatically.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <Maximize2 size={14} className="text-text-secondary" />
                Farm Size (acres) <span className="text-accent-green">*</span>
              </label>
              <input
                type="number"
                name="farmSize"
                required
                step="0.1"
                placeholder="Example: 2.5"
                value={formData.farmSize}
                onChange={handleChange}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-secondary/30 focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 outline-none transition-all"
              />
              <p className="text-[10px] text-text-secondary/70">Total cultivated land area.</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Cultivation Details */}
        <Card className="bg-secondary-bg/20 border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Droplets size={20} />
              </div>
              <div>
                <CardTitle className="text-xl">Cultivation Details</CardTitle>
                <CardDescription className="text-text-secondary">Specifics about your farming practices.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-medium text-white">Irrigation Availability <span className="text-accent-green">*</span></label>
              <div className="flex gap-4">
                {["Yes", "No"].map(val => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="irrigation"
                      value={val}
                      checked={formData.irrigation === val}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      formData.irrigation === val ? "border-accent-green bg-accent-green/20" : "border-white/10 bg-transparent"
                    }`}>
                      {formData.irrigation === val && <div className="w-2 h-2 rounded-full bg-accent-green" />}
                    </div>
                    <span className={`text-sm ${formData.irrigation === val ? "text-white font-medium" : "text-text-secondary group-hover:text-white"}`}>{val}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <Calendar size={14} className="text-text-secondary" />
                Sowing Month <span className="text-accent-green">*</span>
              </label>
              <select
                name="sowingMonth"
                required
                value={formData.sowingMonth}
                onChange={handleChange}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 outline-none transition-all"
              >
                <option value="">Select Month</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <p className="text-[10px] text-text-secondary/70">Used to model seasonal climate effects.</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Additional Information (Optional) */}
        <Card className="bg-secondary-bg/20 border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <BarChart3 size={20} />
              </div>
              <div>
                <CardTitle className="text-xl">Additional Information (Optional)</CardTitle>
                <CardDescription className="text-text-secondary">Optional data to improve accuracy.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Previous Yield (ton/hectare)</label>
              <input
                type="number"
                name="previousYield"
                step="0.01"
                placeholder="Example: 2.8"
                value={formData.previousYield}
                onChange={handleChange}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-secondary/30 focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 outline-none transition-all"
              />
              <p className="text-[10px] text-text-secondary/70">Optional but improves prediction accuracy.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <FlaskConical size={14} className="text-text-secondary" />
                Fertilizer Used
              </label>
              <select
                name="fertilizer"
                value={formData.fertilizer}
                onChange={handleChange}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 outline-none transition-all"
              >
                <option value="">Select Fertilizer</option>
                {fertilizers.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <Beaker size={14} className="text-text-secondary" />
                Seed Variety
              </label>
              <input
                type="text"
                name="seedVariety"
                placeholder="Enter variety name"
                value={formData.seedVariety}
                onChange={handleChange}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-secondary/30 focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <Leaf size={14} className="text-text-secondary" />
                Farming Type
              </label>
              <select
                name="farmingType"
                value={formData.farmingType}
                onChange={handleChange}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 outline-none transition-all"
              >
                <option value="">Select Type</option>
                {farmingTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full bg-accent-green hover:bg-accent-green-hover disabled:bg-white/5 disabled:text-text-secondary disabled:cursor-not-allowed text-black py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] flex items-center justify-center gap-3 transform active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              Predicting...
            </>
          ) : (
            <>
              <TrendingUp size={22} />
              Predict Yield
            </>
          )}
        </button>
      </form>
</div>
);
}

function TrendingUp({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}