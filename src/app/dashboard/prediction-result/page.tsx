"use client";

import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  RotateCcw, 
  LayoutDashboard,
  CloudRain,
  Thermometer,
  Sprout,
  Droplets,
  Zap,
  Activity,
  Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * Structured dummy prediction data
 * Prepared for future API integration
 */
const prediction = {
  yield: 2.8,
  min: 2.3,
  max: 3.4,
  risk: "Moderate",
  confidence: "Medium",
  factors: [
    { name: "Rainfall", impact: "Slightly low", icon: CloudRain, color: "text-blue-400" },
    { name: "Temperature", impact: "Favorable", icon: Thermometer, color: "text-orange-400" },
    { name: "Soil fertility", impact: "Good", icon: Sprout, color: "text-accent-green" },
    { name: "Irrigation", impact: "Available", icon: Droplets, color: "text-cyan-400" }
  ],
  recommendations: [
    { text: "Increase irrigation frequency", priority: "High" },
    { text: "Monitor rainfall patterns", priority: "Medium" },
    { text: "Use nitrogen fertilizer", priority: "Medium" },
    { text: "Consider drought resistant seeds", priority: "Low" }
  ]
};

export default function PredictionResultPage() {
  // Helper to get risk badge styling
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Low": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Moderate": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "High": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  // Helper to get priority badge styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Low": return "bg-green-500/10 text-green-500 border-green-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link 
            href="/dashboard/yield-prediction" 
            className="text-text-secondary hover:text-white flex items-center gap-2 text-sm mb-4 transition-colors group w-fit"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Prediction
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">Prediction Analysis</h1>
          <p className="text-text-secondary mt-1">Based on current seasonal forecasts and farm inputs.</p>
        </div>
        <div className="bg-accent-green/10 text-accent-green px-4 py-2 rounded-xl border border-accent-green/20 flex items-center gap-2 w-fit">
          <CheckCircle2 size={18} />
          <span className="font-semibold uppercase tracking-wider text-xs">Analysis Complete</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* CARD 1 — Prediction Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-secondary-bg/20 border-white/5 overflow-hidden">
            <CardHeader className="bg-white/[0.02] border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-green/10 text-accent-green">
                  <TrendingUp size={20} />
                </div>
                <CardTitle className="text-xl">Expected Yield</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                <div className="text-center md:text-left">
                  <div className="text-5xl md:text-6xl font-bold text-white tabular-nums flex items-baseline gap-2">
                    {prediction.yield}
                    <span className="text-xl font-medium text-text-secondary">ton/hectare</span>
                  </div>
                  <div className="mt-4 flex flex-col gap-1">
                    <p className="text-sm text-text-secondary">Possible Range:</p>
                    <p className="text-lg font-semibold text-white/90">
                      {prediction.min} – {prediction.max} <span className="text-sm font-normal text-text-secondary">ton/hectare</span>
                    </p>
                  </div>
                </div>
                
                <div className="h-px w-full md:h-24 md:w-px bg-white/5" />
                
                <div className="text-center">
                  <p className="text-sm text-text-secondary mb-2">Prediction Confidence</p>
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-2xl font-bold text-accent-green">{prediction.confidence}</div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-1.5 w-8 rounded-full ${i <= 2 ? "bg-accent-green" : "bg-white/10"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-text-secondary mt-4 max-w-[180px]">
                    Prediction based on regional weather patterns and soil estimates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 2 — Risk Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-secondary-bg/20 border-white/5 overflow-hidden">
            <CardHeader className="bg-white/[0.02] border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                  <AlertTriangle size={20} />
                </div>
                <CardTitle className="text-xl">Season Outlook</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-xl border font-bold text-lg ${getRiskBadge(prediction.risk)}`}>
                  {prediction.risk} Risk
                </div>
                <p className="text-white/80 leading-relaxed max-w-md">
                  Rainfall expected slightly below seasonal average. Seasonal pests may require monitoring.
                </p>
              </div>
              <div className="flex -space-x-2">
                {[CloudRain, Activity, Zap].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-secondary-bg border border-white/10 flex items-center justify-center text-text-secondary">
                    <Icon size={18} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 3 — Key Factors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-secondary-bg/20 border-white/5 overflow-hidden">
            <CardHeader className="bg-white/[0.02] border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Activity size={20} />
                </div>
                <CardTitle className="text-xl">Main Factors Affecting Yield</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {prediction.factors.map((factor, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                    <div className={`mb-3 ${factor.color}`}>
                      <factor.icon size={20} />
                    </div>
                    <p className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-semibold">{factor.name}</p>
                    <p className="text-white font-medium">{factor.impact}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 4 — Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-secondary-bg/20 border-white/5 overflow-hidden">
            <CardHeader className="bg-white/[0.02] border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Lightbulb size={20} />
                </div>
                <CardTitle className="text-xl">Recommended Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {prediction.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-accent-green" />
                      <span className="text-white group-hover:text-accent-green transition-colors">{rec.text}</span>
                    </div>
                    <Badge className={`px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${getPriorityBadge(rec.priority)}`}>
                      {rec.priority === "High" ? "High Priority" : rec.priority === "Medium" ? "Suggested" : "Optional"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ACTION BUTTON SECTION */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-end gap-4 pt-4"
        >
          <Link 
            href="/dashboard/yield-prediction"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
          >
            <RotateCcw size={18} />
            Predict Again
          </Link>
          <Link 
            href="/dashboard/overview"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-accent-green text-black font-bold hover:bg-accent-green-hover transition-all shadow-lg shadow-green-950/20 transform active:scale-[0.98]"
          >
            <LayoutDashboard size={18} />
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}