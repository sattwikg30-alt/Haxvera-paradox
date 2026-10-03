"use client";

import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center group">
          <div>
            <span className="text-white drop-shadow-md">Agri</span>
            <span className="text-green-400 drop-shadow-md">Go</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-gray-200 hover:text-white transition-colors drop-shadow-sm"
          >
            Home
          </Link>
          <Link
            href="#features"
            className="text-sm font-medium text-gray-200 hover:text-white transition-colors drop-shadow-sm"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-gray-200 hover:text-white transition-colors drop-shadow-sm"
          >
            How it Works
          </Link>
          <Link
            href="#contact"
            className="text-sm font-medium text-gray-200 hover:text-white transition-colors drop-shadow-sm"
          >
            Contact
          </Link>
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Link
            href="/signup"
            className="rounded-full px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu icon */}
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