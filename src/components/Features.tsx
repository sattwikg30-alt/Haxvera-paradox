"use client";

import { motion } from "framer-motion";
import { CloudRain, BarChart, Sprout } from "lucide-react";

const features = [
  {
    title: "Advanced Climate Intelligence",
    description: "Our AI engine correlates decades of historical rainfall, temperature, and seasonal shifts with real-time satellite data to predict optimal planting windows and growth cycles with unprecedented accuracy.",
    icon: CloudRain,
    colSpan: "md:col-span-2",
    delay: 0.1,
  },
  {
    title: "Yield Risk Forecaster",
    description: "Visualize potential yield variations and financial impacts before committing resources. Mitigate risks effectively.",
    icon: BarChart,
    colSpan: "col-span-1",
    delay: 0.2,
  },
  {
    title: "Actionable Recommendations",
    description: "Receive practical, day-by-day advice on irrigation, fertilization, and harvesting perfectly tailored to your land.",
    icon: Sprout,
    colSpan: "col-span-1",
    delay: 0.3,
  },
];

const Features = () => {
  return (
    <section id="features" className="py-32 relative">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-full h-[500px] bg-accent-green/5 blur-[120px] -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-bg border border-border-green w-fit mb-6"
          >
            <span className="text-xs font-semibold text-accent-green uppercase tracking-widest">Platform Capabilities</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            Farming powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-emerald-400">Precision</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary max-w-2xl mx-auto text-lg font-light"
          >
            We transform complex meteorological and soil data into clear, profitable decisions for your farm.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: feature.delay }}
              className={`group relative glow-box glass p-10 rounded-[2rem] overflow-hidden ${feature.colSpan}`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                <feature.icon size={160} />
              </div>

              <div className="relative z-10">
                <div className="mb-8 p-4 bg-[#0b1a11]/80 border border-white/5 w-fit rounded-2xl text-accent-green shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed text-lg max-w-2xl font-light">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;