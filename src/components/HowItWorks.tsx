"use client";

import { motion } from "framer-motion";
import { Map, CloudRain, Activity, Leaf } from "lucide-react";

const steps = [
  {
    title: "Map Your Farm",
    description: "Input basic location and soil details.",
    icon: Map,
  },
  {
    title: "AI Climate Analysis",
    description: "We cross-reference decades of weather data.",
    icon: CloudRain,
  },
  {
    title: "Yield Prediction",
    description: "Get highly accurate harvest estimates.",
    icon: Activity,
  },
  {
    title: "Smart Execution",
    description: "Follow day-by-day actionable advice.",
    icon: Leaf,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden bg-[#040d08]">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent-green/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-bg border border-border-green w-fit mb-6"
          >
            <span className="text-xs font-semibold text-accent-green uppercase tracking-widest">Workflow</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            Simple Process. <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-emerald-400">Pro Results.</span>
          </motion.h2>
        </div>

        <div className="relative">
          {/* Animated Connecting line (Desktop) */}
          <div className="hidden md:block absolute top-[48px] left-[10%] w-[80%] h-[2px] bg-white/5 z-0">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-transparent via-accent-green to-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-[#0b1a11] border border-white/5 flex items-center justify-center text-text-secondary group-hover:text-accent-green group-hover:bg-accent-green/10 transition-all duration-500 shadow-xl relative z-10 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <step.icon size={36} className="transition-transform duration-500 group-hover:scale-110" />
                  </div>

                  {/* Step number badge */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#143522] rounded-full flex items-center justify-center text-sm font-bold text-white border-4 border-[#040d08] z-20 shadow-lg group-hover:bg-accent-green group-hover:text-[#040d08] transition-colors duration-300">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary text-base font-light px-4">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;