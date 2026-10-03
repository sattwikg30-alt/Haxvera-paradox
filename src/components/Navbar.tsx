"use client";

import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-navbar">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight">
          <span className="text-white">Agri</span>
          <span className="text-accent-green">Go</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-text-secondary hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-text-secondary hover:text-white transition-colors"
          >
            How it works
          </Link>
          <Link
            href="/login"
            className="text-text-secondary hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/get-started"
            className="rounded-xl px-6 py-2.5 bg-accent-green hover:bg-accent-green-hover text-[#040d08] font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu icon (simplified for landing page) */}
        <div className="md:hidden">
          <button className="text-white p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;