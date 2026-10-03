"use client";

import { motion } from "framer-motion";
import { ArrowRight, CloudRain, Thermometer, Sprout, BarChart2 } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative pt-36 pb-32 overflow-hidden bg-grid-pattern">
      {/* Animated Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 -left-64 w-[600px] h-[600px] bg-accent-green/20 blur-[150px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-20%] -right-32 w-[700px] h-[700px] bg-emerald-600/20 blur-[150px] rounded-full pointer-events-none"
      />

      {/* Decorative top gradient */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-green/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-green/10 border border-border-green w-fit mb-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-xs font-semibold text-accent-green uppercase tracking-widest">Agrigo Intelligence 2.0</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] text-white">
              Predict Yield Before the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-emerald-300">Season Decides It.</span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-xl font-light">
              Built for real farming conditions. Get climate-aware insights and actionable recommendations directly on your dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-4">
              <button className="group flex items-center gap-2 bg-accent-green hover:bg-accent-green-hover text-[#040d08] px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-1">
                Start Prediction
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-white">Practical & Precise.</p>
                <p className="text-sm text-text-secondary">No complex data skills needed.</p>
              </div>
            </div>
          </motion.div>

          {/* Right Content: Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative lg:ml-auto w-full max-w-[550px]"
          >
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="glow-box glass p-8 sm:p-10 rounded-[2rem] relative z-20"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-widest mb-2 font-medium">Analysis Target</p>
                  <h3 className="text-3xl font-bold text-white tracking-tight">Rice Field #4</h3>
                </div>
                <div className="bg-accent-green/10 text-accent-green px-4 py-1.5 rounded-full text-sm font-bold border border-accent-green/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                  Live Sync
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="space-y-2">
                  <p className="text-sm text-text-secondary font-medium">Expected Yield</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-4xl font-bold text-white">2.8</p>
                    <span className="text-sm font-normal text-text-secondary">ton/h</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-text-secondary font-medium">Yield Stability</p>
                  <p className="text-2xl font-semibold text-yellow-500 flex items-center gap-2">
                    Moderate
                  </p>
                </div>
              </div>

              {/* Factors */}
              <div className="space-y-5 mb-10">
                <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">Environmental Factors</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3 text-text-secondary">
                      <div className="p-2 bg-blue-500/10 rounded-lg"><CloudRain size={16} className="text-blue-400" /></div>
                      <span className="font-medium text-white">Rainfall</span>
                    </div>
                    <span className="text-white bg-white/10 px-3 py-1 rounded-md text-xs font-medium">Below normal</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3 text-text-secondary">
                      <div className="p-2 bg-orange-500/10 rounded-lg"><Thermometer size={16} className="text-orange-400" /></div>
                      <span className="font-medium text-white">Temperature</span>
                    </div>
                    <span className="text-white bg-white/10 px-3 py-1 rounded-md text-xs font-medium">Normal</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-accent-green/10 border border-accent-green/20 hover:bg-accent-green/20 transition-colors">
                    <div className="flex items-center gap-3 text-text-secondary">
                      <div className="p-2 bg-accent-green/20 rounded-lg"><Sprout size={16} className="text-accent-green" /></div>
                      <span className="font-medium text-white">Soil Health</span>
                    </div>
                    <span className="text-accent-green bg-accent-green/10 px-3 py-1 rounded-md text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">Optimal</span>
                  </div>
                </div>
              </div>

              {/* Recommendation Box */}
              <div className="bg-primary-green/30 border border-accent-green/30 p-5 rounded-2xl relative overflow-hidden group hover:border-accent-green/60 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/10 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 bg-accent-green/20 rounded-xl text-accent-green shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <BarChart2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1.5">Smart Recommendation</p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Increase irrigation frequency by <span className="text-accent-green font-medium">15%</span> due to forecasted low rainfall in week 3.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;