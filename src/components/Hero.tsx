"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Hero = () => {
  const { scrollY } = useScroll();

  // opacity decreases as you scroll down
  const opacity = useTransform(scrollY, [0, 500], [0.9, 0]);

  // optional: slight downward movement for premium feel
  const translateY = useTransform(scrollY, [0, 500], [0, 80]);
  return (
    <section className="relative h-screen min-h-[600px] flex items-center pt-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.png"
          alt="Lush green agriculture field"
          fill
          priority
          className="object-cover object-[center_35%] lg:object-[center_30%]"
        />
        {/* Lighter overlay to keep the text readable while the image spreads across the screen */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full mb-12">
        <div className="w-full lg:w-1/2">
          {/* Left-Aligned Content Only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-start gap-5 text-left"
          >
            {/* Small tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
              <span className="text-xs font-semibold text-green-300 tracking-wide drop-shadow-md">🌿 Nature-Friendly Farming Starts Here</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] mt-1">
              Predict yield before the <span className="text-green-400 drop-shadow-md">season decides.</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-100 leading-relaxed font-medium drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] max-w-[95%]">
              Built for real farming conditions. Get climate-aware insights and actionable recommendations directly on your dashboard.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
              <Link
                href="/signup"
                className="group flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 shadow-lg shadow-green-900/50 hover:shadow-xl hover:shadow-green-900/60 hover:-translate-y-1 w-full sm:w-auto text-sm sm:text-base"
              >
                Start Prediction
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#features"
                className="group flex items-center justify-center gap-2 bg-white/5 hover:bg-white/15 backdrop-blur-sm border-2 border-white/80 hover:border-white text-white px-9 py-4 rounded-full font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 w-full sm:w-auto"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Bottom Background Text */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden z-0 pointer-events-none">

        {/* Text */}
        <motion.h1
          style={{ opacity, y: translateY }}
          className="text-[70px] sm:text-[110px] lg:text-[180px] font-extrabold tracking-widest text-center select-none
          text-transparent 
          bg-gradient-to-b from-white/50 via-white/20 to-white/5
          bg-clip-text
          [text-shadow:0_0_25px_rgba(255,255,255,0.3)]
          [WebkitTextStroke:1px_rgba(255,255,255,0.3)]"
        >
          AGRICULTURE
        </motion.h1>
      </div>

      {/* Bottom Curved Line */}
      <div className="absolute bottom-0 left-0 w-full z-10 pointer-events-none">
        {/* Bottom Curved Line (Animated) */}
        <div className="absolute bottom-0 left-0 w-full z-10 pointer-events-none">
          <motion.svg
            viewBox="0 0 1440 200"
            className="w-full h-[120px]"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0,100 C300,180 900,20 1440,120"
              fill="none"
              stroke="rgba(34,197,94,0.7)"
              strokeWidth="3"
              style={{
                filter: "drop-shadow(0px 0px 8px rgba(34,197,94,0.5))"
              }}
              animate={{
                d: [
                  "M0,100 C300,180 900,20 1440,120",
                  "M0,120 C300,60 900,180 1440,100",
                  "M0,100 C300,180 900,20 1440,120"
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;