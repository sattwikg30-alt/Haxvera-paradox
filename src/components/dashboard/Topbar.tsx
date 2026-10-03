"use client";

import { Bell, Search, Menu } from "lucide-react";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#020402]/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-text-secondary hover:text-white hover:bg-white/5 p-2 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="relative hidden w-64 lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2 text-sm text-white placeholder:text-text-secondary outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-green border border-[#020402] shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
        </button>
      </div>
    </header>
  );
}