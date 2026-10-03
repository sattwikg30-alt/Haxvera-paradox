
import { motion } from "framer-motion";
import { ArrowRight, CloudRain, Thermometer, Sprout, BarChart2 } from "lucide-react";
import Link from "next/link";

const Hero = () => {
return (
    <section className="relative min-h-screen flex items-center pt-32 pb-24 overflow-hidden bg-grid-pattern">
      {/* High Performance Glows - No Animations here */}
      <div className="absolute top-0 left-[-20%] w-[60%] h-[600px] bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.1)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,rgba(0,180,100,0.08)_0%,transparent_70%)] pointer-events-none" />

{/* Decorative top gradient */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-accent-green/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
<div className="grid lg:grid-cols-2 gap-16 items-center">
{/* Left Content */}
<motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
className="flex flex-col gap-8"
>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent-green/10 border border-accent-green/20 w-fit mb-2 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
              <span className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
              <span className="text-xs font-bold text-accent-green uppercase tracking-wider">Agrigo 2.0 Live</span>
</div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.05] text-white">
              Predict yield before the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-emerald-300">season decides.</span>
</h1>

<p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-xl font-light">
Built for real farming conditions. Get climate-aware insights and actionable recommendations directly on your dashboard.
</p>

<div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-4">
              <Link 
                href="/signup"
                className="group flex items-center gap-2 bg-accent-green hover:bg-accent-green-hover text-black px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-[0_0_30px_rgba(0,255,136,0.25)] hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] hover:-translate-y-0.5"
              >
Start Prediction
<ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
<div className="flex flex-col">
                <p className="text-sm font-semibold text-white tracking-wide">Practical & Precise.</p>
<p className="text-sm text-text-secondary">No complex data skills needed.</p>
</div>
</div>
</motion.div>

{/* Right Content: Dashboard Card */}
<motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
className="relative lg:ml-auto w-full max-w-[550px]"
>
            {/* The float animation only modifies transform, which is GPU accelerated and won't cause lag */}
<motion.div
animate={{
                y: [0, -10, 0],
}}
transition={{
                duration: 5,
repeat: Infinity,
ease: "easeInOut"
}}
              className="glass p-8 sm:p-10 rounded-2xl relative z-20 overflow-hidden"
>
              {/* Subtle inner highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
{/* Card Header */}
<div className="flex justify-between items-start mb-10">
<div>
                  <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] mb-2 font-bold">Analysis Target</p>
<h3 className="text-3xl font-bold text-white tracking-tight">Rice Field #4</h3>
</div>
                <div className="bg-accent-green/10 text-accent-green px-3 py-1.5 rounded-md text-xs font-bold border border-accent-green/20 shadow-[0_0_15px_rgba(0,255,136,0.15)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
Live Sync
</div>
</div>

{/* Stats Grid */}
<div className="grid grid-cols-2 gap-8 mb-10">
                <div className="space-y-1">
<p className="text-sm text-text-secondary font-medium">Expected Yield</p>
<div className="flex items-baseline gap-1">
                    <p className="text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">2.8</p>
                    <span className="text-sm font-normal text-text-secondary">ton/ha</span>
</div>
</div>
                <div className="space-y-1">
<p className="text-sm text-text-secondary font-medium">Yield Stability</p>
                  <p className="text-2xl font-bold text-[#FFD700] tracking-tight">
Moderate
</p>
</div>
</div>

{/* Factors */}
              <div className="space-y-4 mb-10">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Environmental Factors</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-white/[0.03] border border-white/5">
<div className="flex items-center gap-3 text-text-secondary">
                      <div className="p-1.5 bg-blue-500/10 rounded-md"><CloudRain size={16} className="text-blue-400" /></div>
                      <span className="font-medium text-white text-xs">Rainfall</span>
</div>
                    <span className="text-white/70 text-[11px] font-medium tracking-wide">Below normal</span>
</div>
                  <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-white/[0.03] border border-white/5">
<div className="flex items-center gap-3 text-text-secondary">
                      <div className="p-1.5 bg-orange-500/10 rounded-md"><Thermometer size={16} className="text-orange-400" /></div>
                      <span className="font-medium text-white text-xs">Temperature</span>
</div>
                    <span className="text-white/70 text-[11px] font-medium tracking-wide">Normal</span>
</div>
                  <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-accent-green/[0.05] border border-accent-green/20">
<div className="flex items-center gap-3 text-text-secondary">
                      <div className="p-1.5 bg-accent-green/20 rounded-md"><Sprout size={16} className="text-accent-green" /></div>
                      <span className="font-medium text-white text-xs">Soil Health</span>
</div>
                    <span className="text-accent-green bg-accent-green/10 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide">Optimal</span>
</div>
</div>
</div>

{/* Recommendation Box */}
              <div className="bg-gradient-to-br from-primary-green/80 to-secondary-bg border border-accent-green/20 p-5 rounded-xl block">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-accent-green/10 rounded-lg text-accent-green self-start">
                    <BarChart2 size={18} />
</div>
<div>
                    <p className="text-xs font-bold text-white mb-1 tracking-wide uppercase">Smart Recommendation</p>
<p className="text-sm text-text-secondary leading-relaxed">
                      Increase irrigation frequency by <span className="text-accent-green font-bold">15%</span> due to forecasted low rainfall in week 3.
</p>
</div>
</div>