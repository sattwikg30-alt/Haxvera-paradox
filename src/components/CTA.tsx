"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Main CTA Block */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.7, ease: "easeOut" }}
           className="relative overflow-hidden rounded-[3rem] p-10 md:p-16 lg:p-20 bg-[#01754C] border border-[#A5CE00]/30 shadow-[0_20px_80px_rgba(1,117,76,0.5)] flex flex-col lg:flex-row items-center gap-16"
        >
          {/* Abstract "Paintings" - Glowing Blobs inside the container */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E0D203] rounded-full mix-blend-plus-lighter opacity-20 blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#A5CE00] rounded-full mix-blend-plus-lighter opacity-20 blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/4" />

          {/* Left Column: Content */}
          <div className="w-full lg:w-1/2 relative z-10 flex flex-col items-start text-left gap-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A5CE00]/20 border border-[#A5CE00]/30 backdrop-blur-md shadow-lg">
              <Sparkles size={14} className="text-[#E0D203]" />
              <span className="text-[11px] sm:text-xs font-black text-[#A5CE00] uppercase tracking-[0.2em] drop-shadow-md">
                Unlock Potential
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tighter drop-shadow-lg">
              Ready to transform your <span className="text-[#A5CE00]">Fields</span> into <span className="text-[#E0D203]">Fortunes?</span>
            </h2>
            
            <p className="text-lg text-white/90 font-light max-w-xl leading-relaxed drop-shadow-md">
              Join the future of climate-aware agriculture. Harness real-time analytics to make data-driven decisions and maximize your yield effortlessly.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 flex items-center gap-3 bg-[#A5CE00] hover:bg-[#E0D203] text-[#01754C] px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 shadow-[0_10px_30px_rgba(165,206,0,0.4)]"
            >
              Start Free Trial
              <ArrowRight size={22} strokeWidth={3} />
            </motion.button>
          </div>

          {/* Right Column: Picture Cards Layout */}
          <div className="w-full lg:w-1/2 relative h-[450px] flex items-center justify-center mt-10 lg:mt-0 z-10">
            {/* Background Accent Glow behind cards */}
            <div className="absolute inset-0 bg-[#A5CE00]/20 blur-3xl rounded-full" />
            
            {/* Card 1 (Back/Right) */}
            <motion.div 
              initial={{ opacity: 0, x: 50, y: -20, rotate: 12 }}
              whileInView={{ opacity: 1, x: 30, y: -20, rotate: 8 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="absolute right-4 md:right-12 top-4 md:top-10 w-48 md:w-64 aspect-[4/5] bg-white/10 backdrop-blur-md p-3 rounded-3xl border border-[#E0D203]/50 shadow-[20px_20px_40px_rgba(0,0,0,0.4)] hover:z-30 hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer group"
            >
              <img src="/2.png" className="w-full h-full object-cover rounded-2xl group-hover:brightness-110 transition-all" alt="Farming Field" />
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 bg-[#E0D203] text-[#01754C] px-4 py-2 font-black text-xs rounded-full shadow-xl rotate-[-8deg] group-hover:rotate-0 transition-transform">
                +24% Yield Growth
              </div>
            </motion.div>

            {/* Card 2 (Front/Left) */}
            <motion.div 
              initial={{ opacity: 0, x: -50, y: 20, rotate: -12 }}
              whileInView={{ opacity: 1, x: -30, y: 20, rotate: -6 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute left-4 md:left-12 bottom-4 md:bottom-10 w-48 md:w-64 aspect-[4/5] bg-white/10 backdrop-blur-md p-3 rounded-3xl border border-[#A5CE00]/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 hover:z-30 hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer group"
            >
              <img src="/3.png" className="w-full h-full object-cover rounded-2xl group-hover:brightness-110 transition-all" alt="Data Analytics" />
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-[#A5CE00] text-[#01754C] px-4 py-2 font-black text-xs rounded-full shadow-xl rotate-[8deg] group-hover:rotate-0 transition-transform">
                Real-Time AI Intel
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
};

export default CTA;