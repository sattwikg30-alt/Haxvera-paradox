"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Search, Menu, AlertTriangle, Loader2 } from "lucide-react";
import { getToken } from "@/lib/authClient";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AlertItem {
  id: number;
  message: string;
  severity: "high" | "medium" | "low";
}

const alertSeverityStyles: Record<AlertItem["severity"], { bg: string; text: string; iconColor: string }> = {
  high: { bg: "bg-red-500/10", text: "text-red-100", iconColor: "text-red-400" },
  medium: { bg: "bg-orange-400/10", text: "text-orange-100", iconColor: "text-orange-400" },
  low: { bg: "bg-yellow-400/10", text: "text-yellow-100", iconColor: "text-yellow-400" },
};

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch("/api/dashboard/overview", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.alerts) {
            setAlerts(json.data.alerts);
          } else {
            setAlerts([]); // Clear out if no alerts are active anymore
          }
        }
      } catch (err) {
         console.error("Topbar failed to load alerts", err);
      }
    }
    fetchAlerts();
  }, [pathname]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

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
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <button 
          onClick={toggleDropdown}
          className="relative p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-full transition-colors focus:outline-none"
        >
          <Bell size={20} />
          {alerts.length > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-green border border-[#020402] shadow-[0_0_10px_rgba(0,255,136,0.5)] animate-pulse" />
          )}
        </button>

        {/* Floating Bell Widget */}
        {isOpen && (
          <div className="absolute top-12 right-0 w-80 max-h-96 overflow-y-auto bg-[#0a0d0a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {alerts.length > 0 && (
                <span className="text-[10px] font-bold bg-accent-green/20 text-accent-green px-2 py-0.5 rounded-full">
                  {alerts.length} New
                </span>
              )}
            </div>
            
            <div className="flex flex-col">
              {alerts.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-text-secondary">
                  No active alerts. Your farms are clear!
                </div>
              ) : (
                alerts.map((alert) => {
                  const style = alertSeverityStyles[alert.severity];
                  return (
                    <div 
                      key={alert.id}
                      className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors flex items-start gap-3 cursor-pointer`}
                    >
                      <div className={`p-1.5 rounded-md ${style.bg} shrink-0`}>
                        <AlertTriangle className={`w-4 h-4 ${style.iconColor}`} />
                      </div>
                      <p className="text-sm text-slate-200 mt-0.5 leading-snug">
                        {alert.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="px-4 py-2 border-t border-white/5 mt-auto">
              <Link href="/dashboard/risk-analysis" className="text-xs font-semibold text-accent-green hover:underline">
                View Risk Analysis Center &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}