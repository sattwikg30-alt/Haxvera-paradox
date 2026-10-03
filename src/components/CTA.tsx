"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-accent-green/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[3rem] p-12 md:p-24 text-center border border-accent-green/30 shadow-[0_0_80px_rgba(16,185,129,0.15)] bg-gradient-to-br from-[#0b1a11]/90 to-[#143522]/90 backdrop-blur-xl"
        >
          {/* Subtle light effect inside */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-green/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-8">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
              Start predicting your farm’s potential today.
            </h2>
            <p className="text-xl text-text-secondary font-light max-w-2xl">
              Join the future of climate-aware agriculture. Make data-driven decisions and maximize your yield effortlessly.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 flex items-center gap-3 bg-accent-green hover:bg-accent-green-hover text-[#040d08] px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            >
              Create Free Account
              <ArrowRight size={22} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;