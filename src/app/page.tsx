"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function Home() {
return (
    <main className="min-h-screen bg-background relative selection:bg-accent-green/30 selection:text-white">
      {/* High-performance cinematic fade-in overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.4)_0%,rgba(0,0,0,1)_100%)]"
      />
<Navbar />
<Hero />
<Features />