"use client";

import { motion } from "framer-motion";
import { Map, CloudRain, Activity, Leaf } from "lucide-react";

const steps = [
  {
    title: "Map Your Farm",
    description: "Input basic location and soil details.",
    icon: Map,
    image: "/1.png",
  },
  {
    title: "AI Climate Analysis",
    description: "We cross-reference decades of weather data.",
    icon: CloudRain,
    image: "/2.png",
  },
  {
    title: "Yield Prediction",
    description: "Get highly accurate harvest estimates.",
    icon: Activity,
    image: "/3.png",
  },
  {
    title: "Smart Execution",
    description: "Follow day-by-day actionable advice.",
    icon: Leaf,
    image: "/4.png",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative overflow-hidden w-full bg-background">
      {/* Floating Header over the collage */}
      <div className="absolute top-0 left-0 w-full z-20 pointer-events-none px-6 pt-24 md:pt-32 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 w-fit mb-6 shadow-2xl"
        >
          <span className="text-[10px] sm:text-xs font-bold text-accent-green uppercase tracking-[0.2em] drop-shadow-md">Process</span>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
        >
          Workflow
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light drop-shadow-md"
        >
          Simple Process. <span className="text-accent-green font-semibold">Pro Results.</span>
        </motion.p>
      </div>

      {/* Seamless Collage Grid */}
      <div className="w-full relative z-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-0">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className="relative group overflow-hidden h-screen w-full bg-black"
            >
              {/* Vibrant Image Background */}
              <img 
                src={step.image} 
                alt={step.title} 
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-all duration-700 ease-out group-hover:scale-110" 
              />
              
              {/* Top gradient to ensure Header readability */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />

              {/* Bottom Gradient for Content Readability */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              {/* Content overlaid on the image */}
              <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end z-10 transition-transform duration-300 group-hover:-translate-y-2">
                <div className="flex items-center justify-between mb-6">
                  {/* Icon Component */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-accent-green/20 group-hover:text-accent-green group-hover:border-accent-green/50 transition-all duration-300 shadow-xl">
                    <step.icon size={28} strokeWidth={1.5} />
                  </div>
                  
                  {/* Step Number */}
                  <div className="text-5xl font-black text-white tracking-tighter opacity-20 group-hover:opacity-40 group-hover:text-accent-green transition-all duration-300">
                    0{index + 1}
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight drop-shadow-md">
                  {step.title}
                </h3>
                
                <p className="text-white/80 text-sm md:text-base font-light leading-relaxed drop-shadow-sm">
                  {step.description}
                </p>
              </div>
              
              {/* Interactive Hover Border/Highlight */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent-green/30 transition-colors duration-300 z-20 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;