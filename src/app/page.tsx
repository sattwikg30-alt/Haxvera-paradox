"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const FadeSection = ({ children, isTop = false }: { children: React.ReactNode, isTop?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: isTop ? ["start start", "end start"] : ["start end", "end start"]
  });

  const opacity = useTransform(
    scrollYProgress, 
    isTop ? [0, 0.8] : [0, 0.15, 0.85, 1], 
    isTop ? [1, 0] : [0, 1, 1, 0]
  );
  
  const scale = useTransform(
    scrollYProgress, 
    isTop ? [0, 0.8] : [0, 0.15, 0.85, 1], 
    isTop ? [1, 0.95] : [0.95, 1, 1, 0.95]
  );

  return (
    <motion.div ref={ref} style={{ opacity, scale }} className="relative will-change-[opacity,transform]">
      {children}
    </motion.div>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative selection:bg-accent-green/30 selection:text-white overflow-hidden">
      {/* High-performance cinematic fade-in overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.4)_0%,rgba(0,0,0,1)_100%)]"
      />
      <Navbar />
      <FadeSection isTop={true}>
        <Hero />
      </FadeSection>
      
      <FadeSection>
        <Features />
      </FadeSection>
      
      <FadeSection>
        <HowItWorks />
      </FadeSection>
      
      <FadeSection>
        <CTA />
      </FadeSection>
      
      <Footer />
    </main>
  );
}